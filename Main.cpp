#include <list>
#include <vector>
#include <string.h>
#include <pthread.h>
#include <cstring>

#include <jni.h>
#include <unistd.h>
#include <fstream>
#include <iostream>
#include <dlfcn.h>
#include "Includes/Unity/Vector2.hpp"
#include "Includes/Unity/Vector3.hpp"
#include "Includes/Unity/Quaternion.hpp"

#include "Includes/Logger.h"
#include "Includes/obfuscate.h"

#include "Includes/Utils.h"
#include "Includes/Strings.h"

#include "KittyMemory/MemoryPatch.h"
#include "Menu.h"

//Target lib here
#define targetLibName OBFUSCATE("libil2cpp.so")

#include "Includes/Macros.h"



/*
// fancy struct for patches for kittyMemory
struct My_Patches {
    // let's assume we have patches for these functions for whatever game
    // like show in miniMap boolean function
    MemoryPatch FreeCraft, FreeLearn, UnlockCraft,IsKnown,Level,InfItems,
    FreeBuild,CanComplete,Durability,FastLoot,ChestKey,ChestLocked,ShowEvents;
    // etc...
} hexPatches;
*/
struct me_player {
    void *object;
    Vector3 location;
    short team;
};

me_player *me;

struct enemy_player {
    void *object;
    Vector3 location;
    short team;
};
short (*get_Team)(void* player);
void *(*get_transform)(void* player);
void (*get_position_Injected)(void *transform, Vector3 *out);

bool isFFA = false;
bool (* old_isFreeForAll) (void  *instance, void *gamemode);
bool isFreeForAll (void  *instance, void *gamemode) {
    if(instance != NULL) {
        isFFA = old_isFreeForAll(instance,gamemode);
    }
    return old_isFreeForAll(instance,gamemode);
}

float NormalizeAngle (float angle){
    while (angle>360)
        angle -= 360;
    while (angle<0)
        angle += 360;
    return angle;
}

Vector3 NormalizeAngles (Vector3 angles){
    angles.X = NormalizeAngle (angles.X);
    angles.Y = NormalizeAngle (angles.Y);
    angles.Z = NormalizeAngle (angles.Z);
    return angles;
}

Vector3 ToEulerRad(Quaternion q1){
    float Rad2Deg = 360.0f / (M_PI * 2.0f);

    float sqw = q1.W * q1.W;
    float sqx = q1.X * q1.X;
    float sqy = q1.Y * q1.Y;
    float sqz = q1.Z * q1.Z;
    float unit = sqx + sqy + sqz + sqw;
    float test = q1.X * q1.W - q1.Y * q1.Z;
    Vector3 v;

    if (test>0.4995f*unit) {
        v.Y = 2.0f * atan2f (q1.Y, q1.X);
        v.X = M_PI / 2.0f;
        v.Z = 0;
        return NormalizeAngles(v * Rad2Deg);
    }
    if (test<-0.4995f*unit) {
        v.Y = -2.0f * atan2f (q1.Y, q1.X);
        v.X = -M_PI / 2.0f;
        v.Z = 0;
        return NormalizeAngles (v * Rad2Deg);
    }
    Quaternion q(q1.W, q1.Z, q1.X, q1.Y);
    v.Y = atan2f (2.0f * q.X * q.W + 2.0f * q.Y * q.Z, 1 - 2.0f * (q.Z * q.Z + q.W * q.W)); // yaw
    v.X = asinf (2.0f * (q.X * q.Z - q.W * q.Y)); // pitch
    v.Z = atan2f (2.0f * q.X * q.Y + 2.0f * q.Z * q.W, 1 - 2.0f * (q.Y * q.Y + q.Z * q.Z)); // roll
    return NormalizeAngles (v * Rad2Deg);
}

Quaternion GetRotationToLocation(Vector3 targetLocation, float y_bias){
    return Quaternion::LookRotation((targetLocation + Vector3(0, y_bias, 0)) - me->location, Vector3(0, 1, 0));
}

Vector3 GetCharacterLocation(void *character){
    Vector3 location;
    get_position_Injected(get_transform(character), &location);

    return location;
}

/*
bool isFFA = false;
bool (*old_IsAllAgainstAllMode)(void* instance,void* Gamemode);
bool IsAllAgainstAllMode (void* instance,void* Gamemode) {
    if(instance != NULL) {
        isFFA  = old_IsAllAgainstAllMode(instance,Gamemode);
    }
    old_IsAllAgainstAllMode(instance,Gamemode);
}
*/


class AimbotBruh {
private:
    std::vector<enemy_player *> *enemies;

public:
    AimbotBruh(){
        enemies = new std::vector<enemy_player *>();


    }




    bool isEnemyPresent(void *enemyObject){
        for(std::vector<enemy_player *>::iterator it = enemies->begin(); it != enemies->end(); it++){
            if((*it)->object == enemyObject){
                return true;
            }
        }

        return false;
    }
/*
    bool isFreeForAll(){
        for(std::vector<enemy_player *>::iterator it = enemies->begin(); it != enemies->end(); it++){
            if((*it)->team == me->team){
                SameTeamCount += 1;

            }else {
                SameTeamCount = 0;
                return false;
            }
        }
        if(SameTeamCount == enemies->size()) {
            SameTeamCount = 0;
                return  true;

        } else
        return false;
    }
*/
    void removeEnemy(enemy_player *enemy){
        for(int i = 0; i<enemies->size(); i++){
            if((*enemies)[i] == enemy){
                enemies->erase(enemies->begin() + i);

                return;
            }
        }
    }

    void removeAllEnemies(){
        for(int i = 0; i<enemies->size(); i++){
            enemies->erase(enemies->begin() + i);

        }
    }

    void tryAddEnemy(void *enemyObject){

        if(isEnemyPresent(enemyObject)){
            return;
        }

        if(enemyObject == NULL) {
            return;
        }

        enemy_player *newEnemy = new enemy_player();

        newEnemy->object = enemyObject;
        newEnemy->location = GetCharacterLocation(enemyObject);
        newEnemy->team = get_Team(enemyObject);


        if(!isFFA) {
            if(newEnemy->team == me->team) {
                return;
            }
        }


        enemies->push_back(newEnemy);
    }




    void updateEnemies(void *enemyObject){
        for(int i=0; i<enemies->size(); i++){
            enemy_player *current = (*enemies)[i];

            int health = *(int *)((uint64_t)current->object + 0xC0);

            if(health <= 1) {
                enemies->erase(enemies->begin() + i);
            } else   if(!isFFA) {
                if(current->team == me->team) {
                    enemies->erase(enemies->begin() + i);
                }
            }



/*
           else if(isFreeForAll()) {

           } else if(current->team == me->team) {
               enemies->erase(enemies->begin() + i);
           }
*/
            if(current->object == enemyObject){
                current->location = GetCharacterLocation(enemyObject);
                current->team = get_Team(enemyObject);

            }
        }
    }

    void removeEnemyGivenObject(void *enemyObject){
        for(int i = 0; i<enemies->size(); i++){
            if((*enemies)[i]->object == enemyObject){
                enemies->erase(enemies->begin() + i);

                return;
            }
        }
    }

    enemy_player *getClosestEnemy(Vector3 myLocation){
        if(enemies->empty()){
            return NULL;
        }

        updateEnemies((*enemies)[0]);

        float shortestDistance = 99999999.0f;
        enemy_player *closestEnemy = NULL;

        for(int i = 0; i<enemies->size(); i++){
            Vector3 currentLocation = (*enemies)[i]->location;
            float distanceToMe = Vector3::Distance(currentLocation, myLocation);

            if(distanceToMe < shortestDistance  ){
                shortestDistance = distanceToMe;
                closestEnemy = (*enemies)[i];
            }
        }

        return closestEnemy;
    }
};

AimbotBruh *aimbotBruh;



bool (*IsCurrentSceneIsMenu) (void * instance);

void(*old_sceneUpdate)(void *instance);
void sceneUpdate (void *instance) {

    if(instance != NULL) {
        bool ismenu = IsCurrentSceneIsMenu(instance);
        if(ismenu) {
            aimbotBruh->removeAllEnemies();
        }
    }
    old_sceneUpdate(instance);
}



float FovValue = 60.0f;
void (*OptionsManagerClass);
void (*set_Fov)(void* OptionManagerClass,float Fov);



bool (*get_isLocalPlayer)(void * instance);



void (*old_UpdateController)(void* Player);
void UpdateController(void * Player) {
    if(Player != NULL && OptionsManagerClass != NULL) {
        set_Fov(OptionsManagerClass,FovValue);
    }

    if(Player != NULL) {
        bool isLocalPlayer = get_isLocalPlayer(Player);
        if(isLocalPlayer) {
            me->object = Player;
            me->location = GetCharacterLocation(me->object);
            me->team = get_Team(me->object);
        }


    }


    return old_UpdateController(Player);
}
bool isZoomed = false;
void(*old_UpdateZoom)(void* instance);
void UpdateZoom (void* instance) {

    if(instance != NULL) {
        isZoomed =    *(bool *)((uint64_t)instance + 0x90);
    }
    old_UpdateZoom(instance);
}


void (*old_UpdateEnemiesController)(void* Player);
void UpdateEnemiesController(void * Player) {

    if(Player != NULL) {


        aimbotBruh->tryAddEnemy(Player);
        aimbotBruh->updateEnemies(Player);

    }
    return old_UpdateEnemiesController(Player);
}
bool RecoilBool;
void (*CalcHeightByTime_old)(void * instance);
void CalcHeightByTime(void * instance) {

    if(instance != NULL && RecoilBool)  {
       return;
    }
     CalcHeightByTime_old(instance);
}

void (*CalcHeightByTime_old2)(void * instance);
void CalcHeightByTime2(void * instance) {

    if(instance != NULL && RecoilBool)  {
        return;
    }
    CalcHeightByTime_old2(instance);
}



void (*SetX) (void* Player,float Xrot);
void (*SetY) (void* Player,float Yrot);
void (*old_LookControllerUpdate)(void* CameraController ,bool isblocked);

bool Aimbot;
void LookControllerUpdate(void * CameraController,bool isblocked) {

    if(CameraController != NULL) {

        if(isZoomed && Aimbot) {
            Vector3 angles;
            enemy_player *target = aimbotBruh->getClosestEnemy(me->location);
            if(target != NULL) {

                angles = ToEulerRad(GetRotationToLocation(target->location, -0.35f));




                if (angles.X >= 275.0f)
                    angles.X -= 360.0f;
                if (angles.X <= -275.0f)
                    angles.X += 360.0f;

                if (angles.Y >= 275.0f)
                    angles.Y -= 360.0f;
                if (angles.Y <= -275.0f)
                    angles.Y += 360.0f;


                SetX(CameraController, angles.Y);
                SetY(CameraController, angles.X);
            }

        }




    }

    return old_LookControllerUpdate(CameraController,isblocked);
}

monoString *(*String_CreateString)(void *_this, const char *str);
void (*get_StringInstance);




// we will run our hacks in a new thread so our while loop doesn't block process main thread
void *hack_thread(void *) {
    LOGI(OBFUSCATE("pthread created"));

    //Check if target lib is loaded
    do {
        sleep(1);
    } while (!isLibraryLoaded(targetLibName));

    //Anti-lib rename
    /*
    do {
        sleep(1);
    } while (!isLibraryLoaded("libMyLibName.so"));*/

    LOGI(OBFUSCATE("%s has been loaded"), (const char *) targetLibName);

#if defined(__aarch64__)
    aimbotBruh = new AimbotBruh();
    me = new me_player();
    A64HookFunction((void*)getAbsoluteAddress(targetLibName, 0xCFAE18),  (void*)isFreeForAll, (void**)&old_isFreeForAll);
    get_Team = (short (*)(void *))getAbsoluteAddress(targetLibName,0x9586A0);
    OptionsManagerClass = (void (*))getAbsoluteAddress(targetLibName,0x9E42FC);
    set_Fov  = (void (*)(void *,float))getAbsoluteAddress(targetLibName,0x9E42FC);
    IsCurrentSceneIsMenu =  (bool (*)(void *))getAbsoluteAddress(targetLibName,0x9D6308);
    A64HookFunction((void*)getAbsoluteAddress(targetLibName, 0xCC0EC4),  (void*)UpdateZoom, (void**)&old_UpdateZoom);
    A64HookFunction((void*)getAbsoluteAddress(targetLibName, 0x9D55BC),  (void*)sceneUpdate, (void**)&old_sceneUpdate);
    A64HookFunction((void*)getAbsoluteAddress(targetLibName, 0xBDBEE0),  (void*)UpdateEnemiesController, (void**)&old_UpdateEnemiesController);
    A64HookFunction((void*)getAbsoluteAddress(targetLibName, 0xCBE210),  (void*)CalcHeightByTime, (void**)&CalcHeightByTime_old);
    A64HookFunction((void*)getAbsoluteAddress(targetLibName, 0x1AC256C),  (void*)CalcHeightByTime2, (void**)&CalcHeightByTime_old2);

    get_isLocalPlayer =  (bool (*)(void *))getAbsoluteAddress(targetLibName,0xDC7818);
    SetX  = (void (*)(void *,float))getAbsoluteAddress(targetLibName,0xAFE2B0);
    SetY  = (void (*)(void *,float))getAbsoluteAddress(targetLibName,0xAFE2C0);
    get_transform = (void *(*)(void *))getAbsoluteAddress(targetLibName,0x1296B48);
    get_position_Injected = (void (*)(void *, Vector3 *))getAbsoluteAddress(targetLibName,0x10BED30);
    A64HookFunction((void*)getAbsoluteAddress(targetLibName, 0xDC9224),  (void*)UpdateController, (void**)&old_UpdateController);


    A64HookFunction((void*)getAbsoluteAddress(targetLibName, 0xAFF3A0),  (void*)LookControllerUpdate, (void**)&old_LookControllerUpdate);


    String_CreateString = (monoString*(*)(void *,const char *))getAbsoluteAddress(targetLibName, 0x173B89C);
    get_StringInstance  = (void (*))getAbsoluteAddress(targetLibName,0x173B89C);


    /*
        hexPatches.FreeCraft = MemoryPatch::createWithHex(targetLibName,
                                                       string2Offset(OBFUSCATE("0x9FE384")),
                                                       OBFUSCATE("20 00 80 D2 C0 03 5F D6"));
         hexPatches.FreeLearn = MemoryPatch::createWithHex(targetLibName,
                                                       string2Offset(OBFUSCATE("0x9FE258")),
                                                       OBFUSCATE("20 00 80 D2 C0 03 5F D6"));

         hexPatches.UnlockCraft = MemoryPatch::createWithHex(targetLibName,
                                                       string2Offset(OBFUSCATE("0x9FE1C4")),
                                                       OBFUSCATE("00 00 80 D2 C0 03 5F D6"));
         hexPatches.IsKnown = MemoryPatch::createWithHex(targetLibName,
                                                       string2Offset(OBFUSCATE("0x9FE178")),
                                                       OBFUSCATE("20 00 80 D2 C0 03 5F D6"));
         hexPatches.Level = MemoryPatch::createWithHex(targetLibName,
                                                       string2Offset(OBFUSCATE("0x9FE0D0")),
                                                       OBFUSCATE("00 00 80 D2 C0 03 5F D6"));
         hexPatches.InfItems = MemoryPatch::createWithHex(targetLibName,
                                                       string2Offset(OBFUSCATE("0xA7F498")),
                                                       OBFUSCATE("80 02 80 D2 C0 03 5F D6"));
          hexPatches.FreeBuild = MemoryPatch::createWithHex(targetLibName,
                                                       string2Offset(OBFUSCATE("0xB423B8")),
                                                       OBFUSCATE("20 00 80 D2 C0 03 5F D6"));

          hexPatches.CanComplete = MemoryPatch::createWithHex(targetLibName,
                                                       string2Offset(OBFUSCATE("0x1ADA780")),
                                                       OBFUSCATE("20 00 80 D2 C0 03 5F D6"));
          hexPatches.Durability = MemoryPatch::createWithHex(targetLibName,
                                                       string2Offset(OBFUSCATE("0x8AAB04")),
                                                       OBFUSCATE("C0 03 5F D6"));
           hexPatches.FastLoot = MemoryPatch::createWithHex(targetLibName,
                                                       string2Offset(OBFUSCATE("0xAAE62C")),
                                                       OBFUSCATE("00 00 80 D2 C0 03 5F D6"));
            hexPatches.ChestKey = MemoryPatch::createWithHex(targetLibName,
                                                       string2Offset(OBFUSCATE("0xAAE660")),
                                                       OBFUSCATE("00 00 80 D2 C0 03 5F D6"));
            hexPatches.ChestLocked = MemoryPatch::createWithHex(targetLibName,
                                                       string2Offset(OBFUSCATE("0xAAE58C")),
                                                       OBFUSCATE("20 00 80 D2 C0 03 5F D6"));
           hexPatches.ShowEvents = MemoryPatch::createWithHex(targetLibName,
                                                       string2Offset(OBFUSCATE("0x19E818C")),
                                                       OBFUSCATE("20 00 80 D2 C0 03 5F D6"));
                                                       */
#else
    //armv7
#endif

    // Anti Leech
    sleep(20);
    if (!titleValid || !headingValid || !iconValid || !settingsValid) {
        int *p = 0;
        *p = 0;
    }

    return NULL;
}

/// -------------------------------------------------------------------- ///

// Do not change or translate the first text unless you know what you are doing
// Assigning feature numbers is optional. Without it, it will automatically count for you, starting from 0
// Assigned feature numbers can be like any numbers 1,3,200,10... instead in order 0,1,2,3,4,5...
// ButtonLink, Category, RichTextView and RichWebView is not counted. They can't have feature number assigned
// Toggle, ButtonOnOff and Checkbox can be switched on by default, if you add True_. Example: CheckBox_True_The Check Box
// To learn HTML, go to this page: https://www.W3schools.com/

jobjectArray getFeatureList(JNIEnv *env, jobject context) {
    jobjectArray ret;

    //Toasts added here so it's harder to remove it
    MakeToast(env, context, OBFUSCATE("Modded by Xxbatman9898"), Toast::LENGTH_LONG);

    const char *features[] = {
            OBFUSCATE("Category_ Cheats"), //Not counted
            OBFUSCATE("SeekBar_FOV_60_120"),
            OBFUSCATE("Toggle_ AimBot"),
            OBFUSCATE("Toggle_ Recoil")






    };

    //Now you dont have to manually update the number everytime;
    int Total_Feature = (sizeof features / sizeof features[0]);
    ret = (jobjectArray)
            env->NewObjectArray(Total_Feature, env->FindClass(OBFUSCATE("java/lang/String")),
                                env->NewStringUTF(""));

    for (int i = 0; i < Total_Feature; i++)
        env->SetObjectArrayElement(ret, i, env->NewStringUTF(features[i]));

    return (ret);
}

void Changes(JNIEnv *env, jclass clazz, jobject obj,
             jint featNum, jstring featName, jint value,
             jboolean boolean, jstring str) {

    LOGD(OBFUSCATE("Feature name: %d - %s | Value: = %d | Bool: = %d | Text: = %s"), featNum,
         env->GetStringUTFChars(featName, 0), value,
         boolean, str != NULL ? env->GetStringUTFChars(str, 0) : "");

    //BE CAREFUL NOT TO ACCIDENTLY REMOVE break;

    switch (featNum) {
        case 0:

            FovValue = value;

            break;

        case 1:

            Aimbot = boolean;

            break;
        case 2:

            RecoilBool = boolean;

            break;










    }
}

__attribute__((constructor))
void lib_main() {
    // Create a new thread so it does not block the main thread, means the game would not freeze
    pthread_t ptid;
    pthread_create(&ptid, NULL, hack_thread, NULL);
}

extern "C"
JNIEXPORT jint JNICALL
JNI_OnLoad(JavaVM *vm, void *reserved) {
    JNIEnv *globalEnv;
    vm->GetEnv((void **) &globalEnv, JNI_VERSION_1_6);

    // Register your class native methods. Build and ecompile the app and see the signature
    // This is to hide function names from disassembler
    // See more: https://developer.android.com/training/articles/perf-jni#native-libraries

    //Your menu class
    jclass c = globalEnv->FindClass("com/android/support/Menu");
    if (c != nullptr){
        static const JNINativeMethod menuMethods[] = {
                {OBFUSCATE("Icon"), OBFUSCATE("()Ljava/lang/String;"), reinterpret_cast<void *>(Icon)},
                {OBFUSCATE("IconWebViewData"),  OBFUSCATE("()Ljava/lang/String;"), reinterpret_cast<void *>(IconWebViewData)},
                {OBFUSCATE("isGameLibLoaded"),  OBFUSCATE("()Z"), reinterpret_cast<void *>(isGameLibLoaded)},
                {OBFUSCATE("setHeadingText"),  OBFUSCATE("(Landroid/widget/TextView;)V"), reinterpret_cast<void *>(setHeadingText)},
                {OBFUSCATE("setTitleText"),  OBFUSCATE("(Landroid/widget/TextView;)V"), reinterpret_cast<void *>(setTitleText)},
                {OBFUSCATE("settingsList"),  OBFUSCATE("()[Ljava/lang/String;"), reinterpret_cast<void *>(settingsList)},
                {OBFUSCATE("getFeatureList"),  OBFUSCATE("()[Ljava/lang/String;"), reinterpret_cast<void *>(getFeatureList)},
        };

        int mm = globalEnv->RegisterNatives(c, menuMethods, sizeof(menuMethods) / sizeof(JNINativeMethod));
        if (mm != JNI_OK) {
            LOGE(OBFUSCATE("Menu methods error"));
            return mm;
        }
    }
    else{
        LOGE(OBFUSCATE("JNI error"));
        return JNI_ERR;
    }

    jclass p = globalEnv->FindClass( OBFUSCATE("com/android/support/Preferences"));
    if (p != nullptr){
        static const JNINativeMethod prefmethods[] = {
                { OBFUSCATE("Changes"), OBFUSCATE("(Landroid/content/Context;ILjava/lang/String;IZLjava/lang/String;)V"), reinterpret_cast<void *>(Changes)},
        };

        int pm = globalEnv->RegisterNatives(p, prefmethods, sizeof(prefmethods) / sizeof(JNINativeMethod));
        if (pm != JNI_OK){
            LOGE(OBFUSCATE("Preferences methods error"));
            return pm;
        }
    }
    else{
        LOGE(OBFUSCATE("JNI error"));
        return JNI_ERR;
    }

    return JNI_VERSION_1_6;
}


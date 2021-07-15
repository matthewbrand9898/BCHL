import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import  logo  from '../HomePage/logo.png';

import { userActions } from '../_actions';
import  logo2  from '../LoginPage/logo.png';
import howTo from '../HomePage/howto.png';
function AboutPage() {


    return (
        <div  className="container-fluid" >
        <div   className='row justify-content-center align-items-center'>
        <div style={{height:'300px' ,display: 'flex'}} className='col align-items-center justify-content-center'>

          <img style={{width:'auto',  height:'auto',maxWidth:'100%',maxHeight:'90%'}} src={logo} />
          </div>
        </div>
        <div  className='row justify-content-center align-items-center'>
          <div style = {{textAlign:'center',height:'100px'}} className='col display-4'>
            WELCOME
            </div>
            <div style = {{position:'absolute',right:'30px',textAlign:'center',top:'10px'}} >
            <Link to="/">Home</Link>
              </div>

        </div>
        <div  className='row justify-content-center align-items-center'>
          <div style = {{textAlign:'center'}} className='col display-5'>
            <br/>
            <br/>
              <p><b>How does this work?</b> <br /> Users have an address generated for them when they sign up.<br />
              This address is their deposit address which they can send bitcoin cash to. <br />
              Users can then buy tickets with this bitcoin cash, which adds them to the draw. <br />
              There is no limit to how many tickets a user can buy. Each one gives them more chance of winning.<br />
              Users can buy a ticket up to one hour before the draw, After which the betting period is closed.<br/>
              Every ticket that is purchased goes into a pool which is the prize. If there are 100 tickets the prize <br />
              will be 500 USD minus 5 percent. <br />

              <br />
              <b>Provably fair?</b><br />
                A random number is generated at the start of the draw.<br />
                The hash of this number is then shown on the site. <br />
                when the draw is called, the random number is shown on the site. <br />
                Users can check this number with the hash at the start of the draw.< br/>
                This number is then calculated inside the total number of tickets, <br />
                to ensure that someone wins every draw.

              <br/>
              <br />
              <b> How to check its Provably fair?</b><br />
                At 23:00:00 UTC + 10 the betting period is closed <br />
                for one hour. Users can take the number that is revealed at this time <br />
                and check that it matches the hash. Also take the number of current entries. <br />
                Now the winning ticket is calculated by RANDOMNUMBER % CURRENTENTRIES + 1.

              <br />
                <br />


              </p>
              <br />
              <br />

            </div>

        </div>

        </div>
    );
}

export { AboutPage };

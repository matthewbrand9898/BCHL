import React, { useEffect , useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authHeader } from '../_helpers';
import { userActions } from '../_actions';
import config from 'config';
import Countdown from '../_helpers/Countdown';
import QRCode from "react-qr-code";
import  logo  from '../HomePage/logo.png';

import howTo from '../HomePage/howto.png';

function HomePage() {

    //const users = useSelector(state => state.users);
    const user = useSelector(state => state.authentication.user);
    const showbuyticketbutton = useSelector(state => state.buyticket.showbutton);
    var ticket = useSelector(state => state.buyticket.Ticket);
    const balance = useSelector(state => state.getbalance.balance);
      const showwithdrawbutton = useSelector(state => state.withdraw.showbutton);
      const [winner, setWinner] = useState(null);
      const [currentEntries_, setcurrentEntries] = useState(null);
      const [currentPrize, setcurrentPrize] = useState(null);
      const [WinningRNG, setWinningRNG] = useState(null);
        const [WinningRNGHash, setWinningRNGHash] = useState(null);
      const [withdrawaddress, setWithdrawaddress] = useState({
          address: '',
          amount: 0
      });


    const dispatch = useDispatch();



    useEffect(() => {

      getbalance(user);
getlastlottowinner(user);
currentEntries(user);
currentPrize_(user);
getwinningRNG(user);
getwinningRNGHash(user);
getTickets(user);
    }, []);

    function getlastlottowinner(user) {
    //  console.log(JSON.stringify(user))
    var data =   '{"txid":"","token":"' + user.token + '"}';

        const requestOptions = {

            method: 'POST',
            headers: {...authHeader(), 'Content-Type': 'application/json' },
            body: data

        };
        fetch(`${config.apiUrl}/users/getlastlottowinner`, requestOptions)
          .then((res) => res.json())
          .then(winner => {
            setWinner(winner.txid);
            //console.log(winner)

})
    }



    function getwinningRNG(user) {
    //  console.log(JSON.stringify(user))
    var data =   '{"RNG":"","token":"' + user.token + '"}';

        const requestOptions = {

            method: 'POST',
            headers: {...authHeader(), 'Content-Type': 'application/json' },
            body: data

        };
        fetch(`${config.apiUrl}/users/getwinningRNG`, requestOptions)
          .then((res) => res.json())
          .then(WinningRNG => {
            setWinningRNG(WinningRNG.RNG);
            //console.log(winner)

})
    }



    function getwinningRNGHash(user) {
    //  console.log(JSON.stringify(user))
    var data =   '{"RNGHash":"","token":"' + user.token + '"}';

        const requestOptions = {

            method: 'POST',
            headers: {...authHeader(), 'Content-Type': 'application/json' },
            body: data

        };
        fetch(`${config.apiUrl}/users/getwinningRNGHash`, requestOptions)
          .then((res) => res.json())
          .then(WinningRNGHash => {
            setWinningRNGHash(WinningRNGHash.RNGHash);
            //console.log(winner)

})
    }


    function currentEntries(user) {
    //  console.log(JSON.stringify(user))
    var data =   '{"currentEntries":"","token":"' + user.token + '"}';

        const requestOptions = {

            method: 'POST',
            headers: {...authHeader(), 'Content-Type': 'application/json' },
            body: data

        };
        fetch(`${config.apiUrl}/users/currentEntries`, requestOptions)
          .then((res) => res.json())
          .then(currentEntries_ => {
            setcurrentEntries(currentEntries_.currentEntries);


  })
    }

    function currentPrize_(user) {
    //  console.log(JSON.stringify(user))
    var data =   '{"currentPrize":"","token":"' + user.token + '"}';

        const requestOptions = {

            method: 'POST',
            headers: {...authHeader(), 'Content-Type': 'application/json' },
            body: data

        };
        fetch(`${config.apiUrl}/users/currentPrize`, requestOptions)
          .then((res) => res.json())
          .then(currentPrize => {
            setcurrentPrize(currentPrize.currentPrize);


  })
    }

    function getTickets(user) {

        dispatch(userActions.getTickets(user));
    }

    function getbalance(user) {

        dispatch(userActions.getbalance(user));
    }



    function handleSubmit(e) {
        e.preventDefault();


        if (withdrawaddress.address && withdrawaddress.amount) {
          dispatch(userActions.withdraw(user,withdrawaddress));
        }
    }
    function handleChange(e) {
        const { name, value } = e.target;
        setWithdrawaddress(withdrawaddress => ({ ...withdrawaddress, [name]: value }));
    }



    function handlebuyticket(user) {

        dispatch(userActions.buyticket(user));


    }

    var d = new Date();
    let datestr;
    if((d.getMonth() +1) > 9) {
      if(d.getDate() > 9) {
          datestr = (d.getFullYear() + '-' + (d.getMonth() +1) + '-' + d.getDate() + 'T' + '23' + ':'+ '59' + ':' + '59' + '.' + '999' + '+10:00').toString()
      } else {
        datestr = (d.getFullYear() + '-' + (d.getMonth() +1) + '-' + '0' + d.getDate() + 'T' + '23' + ':'+ '59' + ':' + '59' + '.' + '999' + '+10:00').toString()
      }
  } else {
    if(d.getDate() > 9){
      datestr = (d.getFullYear() + '-' + '0' + (d.getMonth() +1) + '-' + d.getDate() + 'T' + '23' + ':'+ '59' + ':' + '59' + '.' + '999' + '+10:00').toString()

   } else {
     datestr = (d.getFullYear() + '-' + '0' + (d.getMonth() +1) + '-' + '0' +  d.getDate() + 'T' + '23' + ':'+ '59' + ':' + '59' + '.' + '999' + '+10:00').toString()

   }
  }

 var nd = new Date(datestr);





    const openInNewTab = (url) => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}

    return (


        <div className='container-fluid'>
        <div   className='row justify-content-center align-items-center'>
        <div style={{height:'300px' ,display: 'flex' }} className='col align-items-center justify-content-center'>

          <img style={{width:'auto',  height:'auto',maxWidth:'100%',maxHeight:'90%'}} src={logo} />
          </div>
        </div>
        <div  className='row justify-content-center align-items-center'>
          <div style = {{textAlign:'center',height:'100px'}} className='col display-4'>

            </div>
            <div style = {{position:'absolute',right:'30px',textAlign:'center',top:'10px'}} >
            <Link to="/login">Logout</Link>
              </div>
              <div style = {{position:'absolute',right:'90px',textAlign:'center',top:'10px'}} >
              <Link to="/about">About</Link>
                </div>

        </div>

        <div  className='row justify-content-center align-items-center'>
          <div style = {{textAlign:'center'}} className='col display-5 '>
              <p><b style = {{fontSize:'27px'}}>1.</b>  Deposit bitcoin cash to your address.</p>
            </div>

        </div>
        <div  className='row justify-content-center align-items-center'>
          <div style = {{textAlign:'center'}} className='col display-4'>
              <p style={{wordBreak:'break-all',fontSize:'26px'}}> {user.BCHAddress} </p>

            </div>
        </div>
        <div  className='row justify-content-center align-items-center'>
          <div style = {{textAlign:'center',height:'105px'}} className='col '>
                <QRCode size={100}  value={user.BCHAddress} />

            </div>
        </div>
        <div  className='row justify-content-center align-items-center'>
          <div style = {{textAlign:'center',height:'150px'}} className='col '>
            <h2>Balance</h2>  {balance === undefined? " loading " : balance} USD

            </div>
        </div>

        <div  className='row justify-content-center align-items-center'>
          <div style = {{textAlign:'center'}} className='col display-5'>
            <p>  <b style = {{fontSize:'27px'}}>2.</b> Buy a ticket to go into the draw.</p>
            </div>

        </div>
        <div  className='row justify-content-center align-items-center'>
          <div style = {{textAlign:'center',display:'flex',margin:'10px'}} className='col justify-content-center align-items-center '>
            <button onClick={() => handlebuyticket(user)}  disabled={!showbuyticketbutton} className="btn btn-primary" >Buy a Ticket for $5 USD</button>
            </div>
        </div>


        <div  className='row justify-content-center align-items-center'>
          <div style = {{textAlign:'center',height:'110px'}} className='col  display-5'>
            <b>Tickets: </b> {user.Ticket === undefined ? "loading" :  user.Ticket }
          </div>
        </div>
        <div  className='row justify-content-center align-items-center'>
          <div style = {{textAlign:'center',height:'100px'}} className='col  display-5'>
                <h2>3.</h2>  Withdraw anytime.
          </div>
        </div>
        <form  name="form" onSubmit={handleSubmit}>
          <div  className='row justify-content-center align-items-center'>
          <div style = {{textAlign:'center'}} className='col  display-5'>
              <h2>Withdraw Address</h2>
            </div>
              </div>
              <div  className='row justify-content-center align-items-center'>
              <div style = {{textAlign:'center',height:'60px',display:'flex'}} className='col  display-5 justify-content-center'>
                  <input placeholder="bitcoincash:qrm9ulyexamplef3v5amqy97dcn0zga2jqakkdmdu7" type="text" style={{width:'470px'}} name="address" value={withdrawaddress.address} onChange={handleChange} className={'form-control'} />
                </div>
                  </div>
                  <div  className='row justify-content-center align-items-center'>
                  <div style = {{textAlign:'center'}} className='col  display-5'>
                      <h2>Withdraw Amount</h2>
                    </div>
                      </div>
                  <div  className='row justify-content-center align-items-center'>
                  <div style = {{textAlign:'center',height:'60px',display:'flex'}} className='col  display-5 justify-content-center'>
                      <input type="number" style={{ width: '100px'}} name="amount" value={withdrawaddress.amount} onChange={handleChange} className={'form-control'} />
                    </div>
                      </div>
                      <div  className='row justify-content-center align-items-center'>
                      <div style = {{textAlign:'center',height:'150px',}} className='col  display-5 '>
                          <button className="btn btn-primary" disabled={!showwithdrawbutton}>Withdraw</button>
                        </div>
                          </div>
                        </form>
                  <div  className='row justify-content-center align-items-center'>
                <div style = {{textAlign:'center',height:'100px',}} className='col  display-5 '>
                    <h1>4.</h1>  Wait until the draw is called, every day at 00:00 UTC + 10
                </div>
              </div>
              <div  className='row justify-content-center align-items-center'>
            <div style = {{textAlign:'center',height:'40px',}} className='col  display-5 '>
                  < Countdown  date={nd.toString()} />
            </div>
          </div>
          <div  className='row justify-content-center align-items-center'>
        <div style = {{textAlign:'center',height:'50px',}} className='col  display-5 '>
            <h2>Current Entries  {  currentEntries_ === null ? 'loading' : currentEntries_ }</h2>
        </div>
      </div>
      <div  className='row justify-content-center align-items-center'>
    <div style = {{textAlign:'center'}} className='col  display-5 '>
          <h3>Current Jackpot   {  currentPrize === null ? 'loading' :'$' + currentPrize * 0.92 }</h3>
    </div>
  </div>
  <div  className='row justify-content-center align-items-center'>
<div style = {{textAlign:'center',wordBreak:'break-all'}} className='col  display-5 '>
      <h3>Random Number Hash </h3>  {  WinningRNGHash === undefined ? 'Loading' :WinningRNGHash }
</div>
</div>
  <div  className='row justify-content-center align-items-center'>
<div style = {{textAlign:'center'}} className='col  display-5 '>
      <h3>Random Number   {  WinningRNG === undefined ? 'Not revealed until 23:00:00 UTC + 10' :WinningRNG }</h3>
</div>
</div>
<div  className='row justify-content-center align-items-center'>
<div style = {{textAlign:'center'}} className='col  display-5 '>
  { WinningRNG !== undefined && WinningRNG !== null && currentEntries_ !== 0 &&

    <h3> Winning Ticket: {WinningRNG % currentEntries_ + 1} </h3>

  }
  { WinningRNG !== undefined && WinningRNG !== null && currentEntries_ === 0 &&

    <h3> Winning Ticket: No current entries. </h3>

  }
</div>
</div>
  <div  className='row justify-content-center align-items-center'>
<div style = {{textAlign:'center',height:'150px'}} className='col  display-5 '>
<button style={{wordBreak:'break-all',border:'none'}} className="winner"   onClick={() => openInNewTab('https://www.blockchain.com/bch/tx/' + winner)}> Last Winner Transaction: {winner === null ? "Loading" : winner}</button>
</div>
</div>
          </div>






    );
}

export { HomePage };

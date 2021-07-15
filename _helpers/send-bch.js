/*
  Generates a new HD address for recieving BCH.

  -The next available address is tracked by the 'nextAddress' property in the
  wallet .json file.

  TODO:
*/

'use strict'

const qrcode = require('qrcode-terminal')

const AppUtils = require('slp-cli-wallet/src/util')
const appUtils = new AppUtils()

const config = require('slp-cli-wallet/config')
let  returnvals = {
  "txid": "",
  "Ticket": ""
}
// Mainnet by default.

const NETWORK  = 'mainnet'
const bchjs = new config.BCHLIB({
  restURL: config.MAINNET_REST,
  apiToken: config.JWT
})
//const BCHN_MAINNET = 'https://bchn.fullstack.cash/v4/'
  const SEND_MNEMONIC = 'mouse ready raccoon forward rather throw lift sorry silver cave glow shine'


// Instantiate bch-js based on the network.
//let bchjs
//if (NETWORK === 'mainnet') bchjs = new BCHJS({ restURL: BCHN_MAINNET })


// let _this

class SendBCH  {
  constructor (argv, config) {


    this.bchjs = bchjs
    this.appUtils = appUtils
    this.NETWORK = NETWORK
    this.SEND_MNEMONIC = SEND_MNEMONIC
  }



  async SendBch (filename,senderAddress,amount,recieverAddress ) {




      try {

        const walletInfo = this.appUtils.openWallet(filename)


        let RECV_ADDR  = recieverAddress

        const SATOSHIS_TO_SEND = amount

          const inputs = []

        const SEND_ADDR = senderAddress

        // Get the balance of the sending address.
        const balance = await this.getBCHBalance(SEND_ADDR, false)
        console.log(`balance: ${JSON.stringify(balance, null, 2)}`)
        console.log(`Balance of sending address ${SEND_ADDR} is ${balance} BCH.`)

        // Exit if the balance is zero.
        if (balance <= 0.0) {
          console.log('Balance of sending address is zero. Exiting.')
        throw new Error('Balance Zero')
          return 0
        }

        // If the user fails to specify a reciever address, just send the BCH back
        // to the origination address, so the example doesn't fail.
        if (RECV_ADDR === '') RECV_ADDR = SEND_ADDR

        // Convert to a legacy address (needed to build transactions).
        const SEND_ADDR_LEGACY = this.bchjs.Address.toLegacyAddress(SEND_ADDR)
        const RECV_ADDR_LEGACY = this.bchjs.Address.toLegacyAddress(RECV_ADDR)
        console.log(`Sender Legacy Address: ${SEND_ADDR_LEGACY}`)
        console.log(`Receiver Legacy Address: ${RECV_ADDR_LEGACY}`)

        // Get UTXOs held by the address.
        // https://developer.bitcoin.com/mastering-bitcoin-cash/4-transactions/
        const utxos = await this.bchjs.Electrumx.utxo(SEND_ADDR)
        // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`);

        if (utxos.utxos.length === 0) throw new Error('No UTXOs found.')

        // console.log(`u: ${JSON.stringify(u, null, 2)}`
      //  const utxo = await this.findBiggestUtxo(utxos.utxos)
        // console.log(`utxo: ${JSON.stringify(utxo, null, 2)}`);

        // instance of transaction builder
        let transactionBuilder
        if (this.NETWORK === 'mainnet') {
          transactionBuilder = new this.bchjs.TransactionBuilder()
        }

        const utxos_ = utxos.utxos
        let originalAmount = 0
        for (let i = 0; i < utxos_.length; i++) {
     const thisUtxo = utxos_[i]
     const txout = await bchjs.Blockchain.getTxOut(thisUtxo.tx_hash, thisUtxo.tx_pos)
        if (txout === null) {
          // If the UTXO has already been spent, the full node will respond with null.
          console.log(
            'Stale UTXO found. You may need to wait for the indexer to catch up.'
          )
          continue
        }
     inputs.push(thisUtxo)

     originalAmount += thisUtxo.value

     // ..Add the utxo as an input to the transaction.
     transactionBuilder.addInput(thisUtxo.tx_hash, thisUtxo.tx_pos)
   }
        // Essential variables of a transaction.
        const satoshisToSend = SATOSHIS_TO_SEND


        // add input with txid and index of vout
      //  transactionBuilder.addInput(txid, vout)

        // get byte count to calculate fee. paying 1.2 sat/byte
        const byteCount = this.bchjs.BitcoinCash.getByteCount(
          { P2PKH: inputs.length },
          { P2PKH: 1 }
        )
        console.log(`Transaction byte count: ${byteCount}`)
        const satoshisPerByte = 1.2
        const txFee = Math.floor(satoshisPerByte * byteCount)
        console.log(`Transaction fee: ${txFee}`)

        // amount to send back to the sending address.
        // It's the original amount - 1 sat/byte for tx size
        const remainder = originalAmount - satoshisToSend - txFee

        if (remainder < 0) { throw new Error('Not enough BCH to complete transaction!') }

        // add output w/ address and amount to send
        transactionBuilder.addOutput(RECV_ADDR, satoshisToSend)
        transactionBuilder.addOutput(SEND_ADDR, remainder)

        const hdindex = await this.GetHDIndex(walletInfo,SEND_ADDR)
        // Generate a change address from a Mnemonic of a private key.
        console.log(hdindex)
        const change = await this.changeAddrFromMnemonic(this.SEND_MNEMONIC,hdindex)

        // Generate a keypair from the change address.
        const keyPair = this.bchjs.HDNode.toKeyPair(change)

        // Sign the transaction with the HD node.
        let redeemScript
        inputs.forEach((input, index) => {
          transactionBuilder.sign(
            index,
            keyPair,
            redeemScript,
            transactionBuilder.hashTypes.SIGHASH_ALL,
            input.value
          )
        })

        // build tx
        const tx = transactionBuilder.build()
        // output rawhex
        const hex = tx.toHex()
        // console.log(`TX hex: ${hex}`);
        console.log(' ')

        // Broadcast transation to the network
        const txidStr = await this.bchjs.RawTransactions.sendRawTransaction([hex])
         returnvals = {
            txid: txidStr.toString(),
            Ticket: 1
         }

        // import from util.js file
         this.appUtils.displayTxid(txidStr, walletInfo.network)


      } catch (err) {
        console.log('error: ', err)
        returnvals = {
           txid: '',
           Ticket: 0
        }
      }

        return returnvals
    }



    // Generate a change address from a Mnemonic of a private key.
    async  changeAddrFromMnemonic (mnemonic,hdindex) {
      // root seed buffer
      const rootSeed = await this.bchjs.Mnemonic.toSeed(mnemonic)
      const index = hdindex
      // master HDNode
      let masterHDNode
      if (this.NETWORK === 'mainnet') masterHDNode = this.bchjs.HDNode.fromSeed(rootSeed)


      // HDNode of BIP44 account
      const account = this.bchjs.HDNode.derivePath(masterHDNode, "m/44'/245'/0'")

      // derive the first external change address HDNode which is going to spend utxo
      const change = this.bchjs.HDNode.derivePath(account,`0/${index}`)

      return change
    }

    // Get the balance in BCH of a BCH address.
    async  getBCHBalance (addr, verbose) {
      try {
        const result = await this.bchjs.Electrumx.balance(addr)

        if (verbose) console.log(result)

        // The total balance is the sum of the confirmed and unconfirmed balances.
        const satBalance =
          Number(result.balance.confirmed) + Number(result.balance.unconfirmed)

        // Convert the satoshi balance to a BCH balance
        const bchBalance = this.bchjs.BitcoinCash.toBitcoinCash(satBalance)

        return bchBalance
      } catch (err) {
        console.error('Error in getBCHBalance: ', err)
        console.log(`addr: ${addr}`)
        throw err
      }
    }

/*    // Returns the utxo with the biggest balance from an array of utxos.
    async  findBiggestUtxo (utxos) {
      let largestAmount = 0
      let largestIndex = 0

      for (var i = 0; i < utxos.length; i++) {
        const thisUtxo = utxos[i]
        // console.log(`thisUTXO: ${JSON.stringify(thisUtxo, null, 2)}`);

        // Validate the UTXO data with the full node.
        const txout = await this.bchjs.Blockchain.getTxOut(thisUtxo.tx_hash, thisUtxo.tx_pos)
        if (txout === null) {
          // If the UTXO has already been spent, the full node will respond with null.
          console.log(
            'Stale UTXO found. You may need to wait for the indexer to catch up.'
          )
          continue
        }

        if (thisUtxo.value > largestAmount) {
          largestAmount = thisUtxo.value
          largestIndex = i
        }
      }

      return utxos[largestIndex]
    }
*/
    async  GetHDIndex (walletinfo,senderAddress) {
      let hdIndex
      const Walletinfo = walletinfo
      for (var i = 0; i < walletinfo.addresses.length; i++) {

        var str = JSON.stringify(walletinfo.addresses[i])
        var obj = JSON.parse(str);
  var keys = Object.keys(obj);
    if(senderAddress === obj[keys[1]]) {
      hdIndex = obj[keys[0]]
      return hdIndex
    }








    }

}
}



SendBCH.description = 'SendBCH'



module.exports = SendBCH

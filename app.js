const UrbanBall = require("./UrbanBall.json")
const ercAbi = require('./ERC1155.json')
const ethers = require("ethers")
const axios = require('axios')
const Web3 = require('web3')


async function main() {
    //this contract address is of Urbanball Binance NFT
    const contractAddress = "0x03aC75520Fc874Ff51FD25eA069CC41387853FBd"
    //wss://holy-radial-replica.bsc-testnet.discover.quiknode.pro/078ca3e1bf948d1f2fee3f731e5fe69753f7a272/
    const provider = new ethers.providers.WebSocketProvider('wss://yolo-evocative-log.bsc.discover.quiknode.pro/281e1128297d8dac3139d2364fcfb434b6478c89/')
    const contract = new ethers.Contract(contractAddress, UrbanBall, provider)

    const providerr = 'https://bsc-dataseed3.binance.org/'
    const web3Provider = new Web3(providerr);
    console.log('Function Started')

    // console.log(trv.data.transaction_hash)

    // fromUser = The user transferring the NFT to the dumping address
    // to = the dumping address
    // tokenId = the token id that have been transferred 
    contract.on("Transfer", async (fromUser, to, tokenId, event) => {

        console.log('Listeing')
        let txsHash = event.transactionHash

        if (to == '0xF8E8221A27F2C50Ffc82971eFee082a082885F75') //this is to verify the correct dumping address
        {
            let obj = await axios.get(`https://public.nftstatic.com/static/nft/BSC/BMBEXSPORTS3/${tokenId}`)
            obj = obj.data.name
            let y =  obj.split(' ')
            let verify
            if(y.length == 1){
                 verify = await axios.get('https://meta.ex-sports.io/api/v1/getNftByName?', {
                    params: {
                        nftName: obj + ' '
                    }
                })
            }
            else{
                 verify = await axios.get('https://meta.ex-sports.io/api/v1/getNftByName?', {
                    params: {
                        nftName: obj
                    }
                })
            }
            if (verify.data.message == "NFT found successfully") //this is to verify if the user has sent the right nft that exists in the cms panel
            {
                //the new wrapped nft will be transferred to the user
                const contractAddresssw = "0x7d0e0ca26Edd893fF38a45c4fa9bB3752B26151C" //ERC1155 wrapper address
                web3Provider.eth.accounts.wallet.add('');  //adding private key for transactions
                const contractw = new web3Provider.eth.Contract(ercAbi, contractAddresssw)
                const exsWalletAPI = await axios.get(`https://d1ynuyg3b3bh1q.cloudfront.net/api/transaction/${txsHash}`)

                //2nd verification if the user exists in our DB
                console.log(exsWalletAPI.data)
                const userEXSaddress = exsWalletAPI.data.exs_wallet

                if (txsHash == exsWalletAPI.data.transaction_hash) //verification of the user sent address
                {
                    //transferring the token to the user
                    try {
                        const fromm = '0x2D0a7B531eA68a07e84906dc87F2f92DF725d3De' //this is the address that contains the ERC1155 tokens which will be used in transferring the tokens
                        const tx = await contractw.methods.safeTransferFrom(fromm, userEXSaddress, verify.data.nft.id, 1, '0x').send({ from: '0x2D0a7B531eA68a07e84906dc87F2f92DF725d3De', gasLimit: 2000000 })

                        //for testing purposes
                        await contractw.methods.balanceOf(userEXSaddress, verify.data.nft.id).call(
                            { from: fromm }
                        ).then(result => { console.log(result) })

                        await contractw.methods.balanceOf(fromm, verify.data.nft.id).call(
                            { from: fromm }
                        ).then(result => { console.log(result) })

                    } catch (error) {
                        console.log(error)
                    }
                }
                else {
                    console.log('Verification Failed')
                }
            }
            else {
                console.log("NFT not found")
            }
        }
        else {
            console.log('Wrong Dumping Address')
        }
    })
}

main()







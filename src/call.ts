import { Command } from 'commander'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import * as dotenv from 'dotenv'
import EndpointABI from './endpoint.json'

dotenv.config()
const program = new Command()

// https://etherscan.io/address/0x66a71dcef29a0ffbdbe3c6a460a3b5bc225cd675#code

interface callParams {
  nodeURL: string
  contractAddr: string
  mode: string
  //targetAddr?: string;
  //amount?: number;
}

const checkArgs = (): callParams | undefined => {
  program.option('-m, --mode <string>', 'balance, transfer').parse(process.argv)
  const opts = program.opts()

  const params = ['mode']
  for (const param of params) {
    if (!opts[param]) {
      console.error(`${param} option is required`)
      return undefined
    }
  }

  const envParams = ['NODE_URL', 'CONTRACT_ADDRESS']
  for (const param of envParams) {
    if (!process.env[param]) {
      console.error(`${param} environment variable is required`)
      return undefined
    }
  }

  const callParams: callParams = {
    nodeURL: process.env.NODE_URL || '',
    contractAddr: process.env.CONTRACT_ADDRESS || '',
    mode: opts.mode || 'default',
  }
  //if (opts.address) web3Params.targetAddr = opts.address;
  //if (opts.amount) web3Params.amount = opts.amount;
  return callParams
}

const main = async (): Promise<void> => {
  const args = checkArgs()
  if (args === undefined) throw 'args is invalid'

  try {
    const web3 = new Web3(args.nodeURL)
    // FIXME: You must provide the json interface of the contract when instantiating a contract object
    // https://ethereum.stackexchange.com/questions/94601/trouble-with-web3-eth-contract-abi-usage-with-typescript
    // const endpoint = new web3.eth.Contract(
    //   EndpointABI as AbiItem,
    //   args.contractAddr
    // )
    const contractAbi: AbiItem[] = EndpointABI as AbiItem[];
    console.log(contractAbi)
    console.log(args.contractAddr)

    const endpoint = new web3.eth.Contract(
      contractAbi,
      args.contractAddr
    )

    // const contractAbi: AbiItem[] = HyToken.abi as AbiItem[];
    // const erc20: ERC20 = new ERC20(
    //   args.nodeURL,
    //   args.contractAddr,
    //   contractAbi
    // );

    console.log(`command: ${args.mode}`)
    switch (args.mode) {
      case 'default': {
        await endpoint.methods.estimateFees().call((err: any, res: any) => {
          if (err) {
            console.log('An error occured', err)
            return
          }
          console.log('The balance is: ', res)
        })
        break
      }
      // case 'balance': {
      //   // validate args
      //   if (!args.targetAddr) throw new Error('--address option is required');
      //   const hexBalance: string = await erc20.callBalanceOf(
      //     args.ownerAddr,
      //     args.targetAddr
      //   );
      //   console.log(`balance: ${parseInt(hexBalance, 16)}`);
      //   break;
      // }
      // case 'transfer': {
      //   // validate args
      //   if (!args.targetAddr) throw new Error('--address option is required');
      //   if (!args.amount) throw new Error('--amount option is required');
      //   const resultJSON = await erc20.callTransfer(
      //     args.ownerAddr,
      //     args.targetAddr,
      //     args.amount
      //   );
      //   console.log('result:', resultJSON);
      //   break;
      // }
      // case 'estimateGas': {
      //   const gas = await erc20.callEstimateGas(args.ownerAddr);
      //   console.log(gas);
      // }
    }
  } catch (e) {
    console.error(e)
  }
}

void main()

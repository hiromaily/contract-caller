import { Command } from 'commander'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import * as dotenv from 'dotenv'
import { encodePackedParams } from './utils'
import EndpointABI from '../json/endpoint.json'

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

  // required params
  const params = ['mode']
  for (const param of params) {
    if (!opts[param]) {
      console.error(`${param} option is required`)
      return undefined
    }
  }

  // check environment variables
  const envParams = ['NODE_URL', 'CONTRACT_ADDRESS']
  for (const param of envParams) {
    if (!process.env[param]) {
      console.error(`${param} environment variable is required`)
      return undefined
    }
  }

  // set returned object
  const callParams: callParams = {
    nodeURL: process.env.NODE_URL || '',
    contractAddr: process.env.CONTRACT_ADDRESS || '',
    mode: opts.mode,
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
    const contractAbi: AbiItem[] = EndpointABI as AbiItem[];
    const endpoint = new web3.eth.Contract(
      contractAbi,
      args.contractAddr
    )

    console.log(`command: ${args.mode}`)
    switch (args.mode) {
      case 'endpoint': {
        // params
        const chainID = 101

        // FIXME: Error: invalid address (argument="address", value="0x", code=INVALID_ARGUMENT, version=address/5.7.0) 
        //        (argument="_userApplication", value="0x", code=INVALID_ARGUMENT, version=abi/5.7.0)
        const ua = "0x0000000000000000000000000000000000000000"
        
        const payload = "0x"
        const payInZro = false
        const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
        const adapterParams = {
          [1]: { types: ["uint16", "uint256"], values: [1, 200000] },
          [2]: { types: ["uint16", "uint256", "uint256", "address"], values: [2, 200000, 100000, ZERO_ADDRESS] },
        }
        const fmtAdapterParams = encodePackedParams(web3, adapterParams[2].types.slice(0, -1), adapterParams[2].values.slice(0, -1))        

        // call
        await endpoint.methods.estimateFees(chainID, ua, payload, payInZro, fmtAdapterParams).call((err: any, res: any) => {
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

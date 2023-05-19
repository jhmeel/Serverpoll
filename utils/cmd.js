import axios from 'axios';
import { table } from 'table';
import Config from '../src/config.js'
import Emitter from './emitter.js'
import ora from 'ora'

const {ADMIN_ID, ADMIN_TITLE} = Config.ADMIN
const baseUrl = Config.BASE_URL
 const emitter = Emitter.getInstance()




const axiosInstance = axios.create({
    baseURL: baseUrl,
    headers: {
        'Content-Type': 'application/json',
        'x-role-id':ADMIN_ID,
        'x-user-role': ADMIN_TITLE
    },
});

export const fetchData = async (url) => {

    const config = {
        columnDefault: {
            width: 10,
          },
          columns: [
            { alignment: 'left' },
            { alignment: 'center' },
            { alignment: 'right' },
            { alignment: 'justify' }
          ],
      };
    const spinner = ora('Making Request..').start()
    try {
        
      
        const response = await axiosInstance.get(url);

        const data = response.data;
        const headers = Object.keys(data[0]);
        const values = data.map((item) => Object.values(item));
        const output = [headers, ...values];
        const tableOutput = table(output, config);
        spinner.succeed(`HTTP ${response.status}`)
        return tableOutput;
    } catch (error) {  
      spinner.fail(`Error: ${error.message}`)
    }
}


export const postData = async (url, payload) => {
    const spinner = ora('Making Request..').start()
    try {
        
        const response = await axiosInstance.post()
        spinner.succeed(`HTTP ${response.status}`)
        return response
    } catch (error) {
       
spinner.fail(`Error: ${error.message}`)
    }


}


export const updateData = async (url, payload) => {
    const spinner = ora('Making Request..').start()
    try {
        
        const response = await axiosInstance.put(url, payload)
        spinner.succeed(`HTTP ${response.status}`)
        return response
    }
    catch (error) {
     
    spinner.fail(`Error: ${error.message}`)
    }
}


export const deleteData = async (url) => {
    const spinner = ora('Making Request..').start()
    try {
      
        const response = await axiosInstance.delete(url)
        spinner.succeed(`HTTP ${response.status}`)
        return response
    }
    catch (error) {
        spinner.fail(`Error: ${error.message}`)
    }
}


export const healthCheck = async () => {
    const spinner = ora('Loading..').start()
    try {
       
        const response = await axiosInstance.get('/healthcheck')
        spinner.succeed(`HTTP ${response.status}`)
        return response
    }
    catch (error) {
        spinner.fail(`Error: ${error.message}`)
    }
}

export const emitTerminalEvent = (reason) => {
    const spinner = ora('Emitting terminal event...').start()
    try{
        emitter.emit('@admin:shutdown:server', reason)
        spinner.succeed(`Server shutdown-event sent successfully!`)
    }catch(error){
        spinner.fail(`Error: ${error.message}`)
    }
    
}
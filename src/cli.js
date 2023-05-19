import inquirer from 'inquirer';
import chalk from 'chalk';
import validUrl from 'valid-url'
import { fetchData, deleteData, updateData, postData, healthCheck, emitTerminalEvent } from '../utils/cmd.js';
import Config from './config.js'
const { USERNAME, PASSWORD } = Config.ADMIN
const logger = {
    info: (message) => console.log(chalk.blue(message)),
    success: (message) => console.log(chalk.green(message)),
    warn: (message) => console.log(chalk.yellow(message)),
    error: (message) => console.log(chalk.red(message)),
};

class AdminCLI {
    constructor() {
        this.username = null;
        this.password = null;
        this.isAuthenticated = false;

        this.requestPrompts = [
            {
                type: 'list',
                name: 'method',
                message: 'Choose an HTTP method:',
                choices: ['GET', 'POST','PUT', 'PATCH', 'DELETE'],
            },
            {
                type: 'input',
                name: 'url',
                message: 'Enter the Url:',
                validate:(value) =>{
                    if(validUrl.isUri(value)){
                        return true
                    }else{
                        logger.warn('\nPlease enter a valid URL!')
    
                    }
                },
            },
            {
                type: 'input',
                name: 'payload',
                message: 'Enter a payload',
                when:(answers)=> ['POST','PUT'].includes(answers.method),
            },
        
        ]
        this.actions = [
            'Make HTTP Request',
            'Shutdown Server',
            'Get Server Health Status',
            'Run Script',
        ];
    
       
        this.mainPrompt = [
            {
                type: 'list',
                name: 'Commands',
                choices: this.actions,
            },
        ]
      
    }

    start() {
     this._setUpAuthenticationPrompt()
    }



    async _setUpAuthenticationPrompt() {
        let  failedAttempts = 0
       
        do{
            
            
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'username',
                message: 'Enter admin username:',
      },
            {
                type: 'password',
                name: 'password',
                mask:'*',
                message: 'Enter admin password:',
      },
    ]);

        if (answers.username === USERNAME && answers.password === PASSWORD) {
            this.isAuthenticated = true;
            logger.success('Authentication successful.');
            
            this._setUpCommands();
          
        } else {
         
            logger.error('Authentication failed. Invalid username or password.\n Try again') 
            failedAttempts++     
        }
    }while(!this.isAuthenticated && failedAttempts < 3);
    if (failedAttempts == 3){
        logger.error('\nUnauthorized Attempts')
        process.exit(1)
    }
}

   
async _setUpCommands(){
        
   
        const {Commands} = await inquirer.prompt(this.mainPrompt)
        switch (Commands){
         
            case 'Make HTTP Request':
                this.makeRequest()  
            break;
            case 'Shutdown Server':
               this.shutDownServer()
                break;
                case 'Run Script':
                    this.runScript()
                    break;
                case 'Get Server Health Status':
                    logger.info(healthCheck())
                break;

            default:
            logger.error(`Invalid Command:{${Commands}}`)
        }
    }

    
async makeRequest (requestPrompts = this.requestPrompts){
    const answer = await inquirer.prompt(requestPrompts)
    let response = ''
    switch (answer.method){
        case 'GET':
            response = fetchData(answer.url);
            logger.info(response)
            
            break;
            case 'POST':
                response = postData(answer.url, answer.payload)
                logger.info(response)
                break;
            case 'PUT':
                response = updateData(answer.url, answer.payload)
                logger.info(response)
                break;
            case 'PATCH':
                response = updateData(answer.url, answer.payload)
                logger.info(response)
                break;
            case 'DELETE':
                response = deleteData(answer.url);
                logger.info(response)
                break;
            default:
                logger.error('Invalid request method!')
    
    }
}
async shutDownServer(){
   const answer = inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to terminate the server?\n`,
    },
    {
        type: 'input',
        name: 'reason',
        message: `Provide reasons why server should  be terminated:\n `,
    
    }]).then((answer) => {
        if (answer.confirm && answer.reason) {
           
            try{
                emitTerminalEvent(answer.reasons)
               
            }catch(error){
                logger.error(error.message)
            }
           
        } else {
            logger.warn('Termination action cancelled.');
        }
    });
    
} 

runScript(){
  //run script logic  
}
}



export default AdminCLI;


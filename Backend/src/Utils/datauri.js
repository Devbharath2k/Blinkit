import DataURIparser from 'datauri/parser.js';
import path from 'path';

const getdatauri = (file) => {

    if(!file || !file.originalname || !file.buffer){
        throw new Error('Invalid file');
    }
    
    const parser = new DataURIparser();
    const ExtName = path.extname(file.originalname).toString();
    return parser.format(ExtName, file.buffer);
}

export default getdatauri;
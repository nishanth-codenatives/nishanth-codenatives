const { v4: uuidv4, validate: uuidValidate  } = require('uuid');

module.exports = (modalMap) => {

    const sampleTbl = modalMap["sample"];
    const sampleRoleTbl = modalMap["sampleRole"];
    const Op = modalMap.Sequelize.Op;
    
const sample = async (req , res) =>{

    res.send('sample controller')    
}

const show = async(req, res) =>{

    try {
    let sampleData = await sampleTbl.findAll();
    if(sampleData.length==0)
    {
        res.send("table is empty")
    }
    else
    res.send(sampleData);
   }
   catch(e)
   {
       console.log(e);
   }
}

const showRole = async(req, res) =>{

    try {
    let sampleData = await sampleRoleTbl.findAll();
    if(sampleData.length==0)
    {
        res.send("table is empty")
    }
    else
    res.send(sampleData);
   }
   catch(e)
   {
       console.log(e);
   }
}


const insert = async(req, res) => {

    try {
        let data = req.body;
        data.id = uuidv4();
        //console.log(Object.keys(data).length);
        if(Object.keys(data).length == 4)
        {
        let insertSample =  await sampleTbl.create(data);
        res.send(insertSample);
        }
        else {
            res.send("please insert all the details")
        }

    } catch(e)
    {
        console.log(e)
    }

}

const insertRole = async(req, res) => {

    try {
        let data = req.body;
        data.id = uuidv4();
        console.log(data);
        //console.log(Object.keys(data).length);
        if(Object.keys(data).length == 4)
        {
        let insertSample =  await sampleRoleTbl.create(data);
        res.send(insertSample);
        }
        else {
            res.send("please insert all the details")
        }

    } catch(e)
    {
        console.log(e)
    }

}


const del = async(req,res) =>
{
    let id = req.params.id;
    if ( id.length != 36)
    {
        res.send("invalid id");
    }
    else {
     await sampleTbl.destroy({
        where: { id: id}
     });
     res.send("deleted successfully")
    }
}

const upd = async(req,res) => {
    let id = req.params.id;
    if(id.length!=36)
    {
        res.send("invalid id")
    }
    else {
        let data = req.body;
        await sampleTbl.update(data, {
            where: {id: id}
        })
        res.send("data updated successfully");
    }
}

const search = async(req,res)=>{
    let condition = {};
    
    if(req.query.search)
    {
        condition = {
            [Op.or]: [
		{
		   '$sampleRole.username$': { 
					  [Op.like]: '%' + req.query.search + '%' 
		    }
		},
                {
                    name: {
                        [Op.like]: '%' + req.query.search + '%'
                    } 
                },
                {
                    mobile: {
                        [Op.like]: '%' + req.query.search + '%'
                    } 
                }
    
    
    ]
        };

    }

    try {
    let findData = {};
    if (req.query.sortField)
    {
        findData.order = [[req.query.sortField, req.query.direction]]
    }
    if (req.query.offset)
    {
        findData.offset = req.query.offset;
    }
    if (req.query.limit)
    {
        findData.limit = req.query.limit;
    }

    findData.where=condition;
    findData.include = [{ model: sampleRoleTbl, as: "sampleRole" }];
    let sampleSearch = await sampleTbl.findAll(findData);
    // let options = {
    //     where: 
    //     {[Op.or]:
    //     [
    //     {'$sample.name$': { [Op.like]: '%' + req.query.search1 + '%' }},
    //     {username: { [Op.like]: '%' + req.query.search1 + '%' }}
    //     ]},
    //     include: [{
    //         model: sampleTbl,
    //         as: "sample"
    //       }]  };


    //let sampleSearchRole = await sampleRoleTbl.findAll({ include: 'sample' });
    //let sampleSearchRole = await sampleRoleTbl.findAll(options);
    res.send(sampleSearch);    
    } catch(error)
    {
        res.send(error);
    }    
        
}

return {
            sample, show, insert, del, upd, search, showRole, insertRole
}



}
const reqResponse = require('../../cors/responseHandler');
const { v4: uuidv4, validate: uuidValidate  } = require('uuid');
const moment = require("moment");
module.exports = (modalMap) => {
    const account_user_tbl = modalMap['accountUser'];
    const team_member_tbl = modalMap['teamMember']
    const team_tbl = modalMap['team']

    /* ADD TEAM AND TEAM MEMBERS */
    const addTeam = async (req , res) =>{
        const {account_user_id , org_id} = req.headers
        if(!req.body){
            return res.status(400).send({
                "status" : false,
                error: "Fields are Mandatory"
            })
        }
        if(!account_user_id || !org_id){
            return res.status(400).send({
                "status" : false,
                error: "Fields are Mandatory"
            })
        }
        try {
            const {team_name , description , team_members} = req.body
            if(team_members.length < 1){
                return res.status(400).send({
                    "status" : false,
                    error: "Please Add team member"
                })
            }
            let create_team = await team_tbl.create({
                id : uuidv4(),
                org_id : org_id,
                account_user_id : account_user_id ,
                team_name : team_name,
                description : description ,
                created_at : moment().format('YYYY-MM-DD H:m:s'),
                updated_at : moment().format('YYYY-MM-DD H:m:s'),
                enable_flag : true ,
                is_voided : false,
                is_delete : false ,
                created_by : account_user_id,
                modified_by : account_user_id
            })
            var i =0 ;
            
            let team_members_list =[]
            while(i < team_members.length){
                //console.log(uuidv4())
                let members = {
                    id : uuidv4(),
                    org_id : org_id,
                    account_user_id : account_user_id ,
                    team_id : create_team.id,
                    created_at : moment().format('YYYY-MM-DD H:m:s'),
                    updated_at : moment().format('YYYY-MM-DD H:m:s'),
                    enable_flag : true ,
                    is_voided : false,
                    is_delete : false ,
                    created_by : account_user_id,
                    modified_by : account_user_id
                }
                team_members_list.push(members)
                i++;
            }
            //console.log(team_members_list)
            let createTeam = await team_member_tbl.bulkCreate(team_members_list)
            return res.status(200).send(reqResponse.sucessResponse(200, 'Created Team Successfully', createTeam));
        } catch (error) {
            return res.status(400).send(reqResponse.errorResponse(400, error));
        }
    }

    /* list Team and Team Members */
    const teamAndTeamList = async (req , res)=>{
        const {account_user_id , org_id} = req.headers
        
        if(!account_user_id || !org_id){
            return res.status(400).send({
                "status" : false,
                error: "Fields are Mandatory"
            })
        }
        try {
            let findData = {}
            findData.where ={org_id , is_delete:false}
            findData.attributes=['id', 'team_name' , 'description' , 'created_at' , 'created_by']
            findData.include = [
                {
                    model : team_member_tbl, as : "teammember", attributes :['id' , 'team_id'],
                    include : [
                        {model : account_user_tbl, as : "accountuser", attributes :['id','first_name','last_name']}
                    ]
                }
            ]
            let getTeamscount = await team_tbl.findAll(findData)
            let page, pageSize
            page = req.query.page ? req.query.page : 1;
            pageSize = req.query.pageSize ? req.query.pageSize : 10
            let limit = pageSize
            let pageNumber = page
            let offset = pageNumber ? (pageNumber-1) * limit : 0
            
            if(req.query.page){
                findData.offset = offset;
            }
            if(req.query.pageSize){
                findData.limit = limit;
            }
            let totalCount = getTeamscount ? getTeamscount.length : 0
            let getTeams = await team_tbl.findAll(findData)
            if(getTeams.length < 1){
                return res.status(400).send({
                    "status" : false,
                    error: "No Data Found"
                })
            }
            let data ={
                totalCount,
                data : getTeams
            }
            return res.status(200).send(reqResponse.sucessResponse(200, 'Team and Team Members', data));
        } catch (error) {
            return res.status(400).send(reqResponse.errorResponse(400, error));
        }
    }
    /* delete Team  */
    const deleteTeam = async (req , res) =>{
        const {account_user_id , org_id} = req.headers
        if(!account_user_id || !org_id){
            return res.status(400).send({
                "status" : false,
                error: "Fields are Mandatory"
            })
        }
        try {
            const {id} = req.params
            let deleteTeam = await team_tbl.update({
                is_delete : true 
            }, { where : { org_id , id}} )
            return res.status(200).send(reqResponse.sucessResponse(200, 'Team deleted successfully', deleteTeam));
        } catch (error) {
            //res.send(error)
            return res.status(400).send(reqResponse.errorResponse(400, error));
        }
    }
    /* Edit Team and Team Members*/
    const editTeamAndTeamMembers = async (req , res)=>{
        const {account_user_id , org_id} = req.headers
        if(!req.body){
            return res.status(400).send({
                "status" : false,
                error: "Fields are Mandatory"
            })
        }
        if(!account_user_id || !org_id){
            return res.status(400).send({
                "status" : false,
                error: "Fields are Mandatory"
            })
        }
        try {
            const {team_name , description , team_members} = req.body
            if(team_members.length < 1){
                return res.status(400).send({
                    "status" : false,
                    error: "Please Add team member"
                })
            }
            const {id} = req.params
            console.log(id)
            let update_team = await team_tbl.update({
                team_name : team_name,
                description : description 
            } , {where :{ org_id , id}})
            var i =0 ;
            let destroy_team_members = await team_member_tbl.destroy({
                where : {org_id : org_id , team_id : id} 
            })
            let team_members_list =[]
            while(i < team_members.length){
                //console.log(uuidv4())
                let members = {
                    id : uuidv4(),
                    org_id : org_id,
                    account_user_id : account_user_id ,
                    team_id : id,
                    created_at : moment().format('YYYY-MM-DD H:m:s'),
                    updated_at : moment().format('YYYY-MM-DD H:m:s'),
                    enable_flag : true ,
                    is_voided : false,
                    is_delete : false ,
                    created_by : account_user_id,
                    modified_by : account_user_id
                }
                team_members_list.push(members)
                i++;
            }
            //console.log(team_members_list)
            let createTeam = await team_member_tbl.bulkCreate(team_members_list)
            return res.status(200).send(reqResponse.sucessResponse(200, 'Edited Team Successfully', createTeam));
        } catch (error) {
            //res.send(error)
            return res.status(400).send(reqResponse.errorResponse(400, error));
        }
    }
    /* View Team and TeamMembers */
    const viewParticularTeam = async (req , res)=>{
        const {account_user_id , org_id} = req.headers
        if(!req.body){
            return res.status(400).send({
                "status" : false,
                error: "Fields are Mandatory"
            })
        }
        if(!account_user_id || !org_id){
            return res.status(400).send({
                "status" : false,
                error: "Fields are Mandatory"
            })
        }
        try {
            const {id} = req.params
            let findData = {}
            findData.where ={org_id , id, is_delete:false}
            findData.attributes=['id', 'team_name' , 'description' , 'created_at' , 'created_by']
            findData.include = [
                {
                    model : team_member_tbl, as : "teammember", attributes :['id' , 'team_id'],
                    include : [
                        {model : account_user_tbl, as : "accountuser", attributes :['id','first_name','last_name']}
                    ]
                }
            ]
            let data = await team_tbl.findAll(findData)
            if(data.length < 1){
                return res.status(400).send({
                    "status" : false,
                    error: "No Data Found"
                })
            }
            return res.status(200).send(reqResponse.sucessResponse(200, 'Team List', data));
        } catch (error) {
            return res.status(400).send(reqResponse.errorResponse(400, error));
        }
    }
    return {addTeam , teamAndTeamList , deleteTeam , editTeamAndTeamMembers , viewParticularTeam}
}
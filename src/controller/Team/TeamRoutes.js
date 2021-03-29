const router = require('express').Router();
const {modelMap } = require("../../models");
const RouteConstant = require('../../constant/Routes');
const TeamController = require('./TeamController')(modelMap);

module.exports = (app) => {
    router.route('/').post(TeamController.addTeam); // add team and team members
    router.route('/').get(TeamController.teamAndTeamList); // list all team and team members
    router.route('/:id').delete(TeamController.deleteTeam);  // delete team 
    router.route('/:id').put(TeamController.editTeamAndTeamMembers); // edit team and team members
    router.route('/view/:id').get(TeamController.viewParticularTeam); // display particular team
    app.use(`${RouteConstant.VERSION+RouteConstant.TEAM}`, router);
    
};
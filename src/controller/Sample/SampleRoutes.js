const router = require('express').Router();
const {modelMap } = require("../../models");
const RouteConstant = require('../../constant/Routes');

const {authenticateCheck, authorizationCheck} = require('../../cors/middleware');
const SampleController = require('../Sample/SampleController.js')(modelMap);

module.exports = (app) => {
    router.route('').get(SampleController.sample);
    router.route('/show').get(SampleController.show);
    router.route('/showrole').get(SampleController.showRole);
    router.route('/insert').post(SampleController.insert);
    router.route('/insertrole').post(SampleController.insertRole);
    router.route('/delete/:id').delete(SampleController.del);
    router.route('/update/:id').put(SampleController.upd);
    router.route('/search').get(SampleController.search);

    app.use(`${RouteConstant.VERSION+RouteConstant.SAMPLE}`, router);
}    
import AdminService from "../services/admin.service";
import httpStatusCodes from "http-status-codes";
import apiResponse from "../utilities/apiResponse";
import logger from "../config/logger";

export class AdminController {
  public static async registerAdmin(req, res) {
    const { newAdmin } = req.body;
    try {
      await AdminService.registerAdmin(newAdmin);
      return apiResponse.result(
        res,
        { message: "Successfully Registered" },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error("[adminController.registerAdmin]:" + e.toString());
      return apiResponse.error(res, 400, { message: e.toString() });
    }
  }

  public static async updateAdmin(req, res) {
    const { admin } = req.body;
    try {
      await AdminService.updateAdmin(admin);
      apiResponse.result(res, { message: "success" }, httpStatusCodes.OK);
    } catch (e) {
      logger.error("[adminController.updateAdmin]" + e.toString());
      return apiResponse.error(res, 400, { message: e.toString() });
    }
  }

  public static async viewAdmins(req, res) {
    //   const { admin } = req.body;
    //  try {
  }

  public static async viewAdminDetails(req, res) {}
}

/*

//get all course
this.getAllCourses=function(){
return new Promise((resolve, reject) => {
    courseSchema.find().exec().then(data => {
                        resolve({'status': 200, 'message':'get all course    
data', 'data': data});
    }).catch(err => {
                        reject({'status': 404, 'message':'err:-'+err});
    })
    })
}
//get specific course details
this.getSpecificCourse = function(id){
return new Promise((resolve, reject) => {
    courseSchema.find({code: id}).exec().then(data => {
                        resolve({'status': 200, 'message':'get single data',   
'data': data});
    }).catch(err => {
                        reject({'status': 404, 'message':'err:-'+err});
                })
})
}


show: (req, res, next) => {
var subscriberId = req.params.id;
Subscriber.findById(subscriberId)
.then(subscriber => {
res.locals.subscriber = subscriber;
next();
})
.catch(error => {
console.log(`Error fetching subscriber by ID:
➥ ${error.message}`)
next(error);
});
},
showView: (req, res) => {
res.render("subscribers/show");
}






*/

import AdminService from "../services/admin.service";
import httpStatusCodes from "http-status-codes";
import apiResponse from "../utilities/apiResponse";
import logger from "../config/logger";
import {
  USER_TYPE_ENUM_OPTIONS,
  ADMIN_PERMISSION_ENUM_OPTIONS,
} from "src/constants/enum";
import { Admin } from "src/models/Admin";

export class AdminController {
  public static async registerAdmin(req, res) {
    const { user } = req; //user is the superadmin making the request to register
    const { newAdmin } = req.body;

    try {
      const adminCreator = await Admin.findByPk(user.accountId);
      await AdminService.registerAdmin(newAdmin, adminCreator);
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
    const { user } = req; //user is the user who is making the request
    const { accountId } = req.params; //accountId of the admin who is being updatred
    const { admin } = req.body;

    //check if superadmin is making the update
    if (
      user.accountId == accountId &&
      user.permissionType != ADMIN_PERMISSION_ENUM_OPTIONS.SUPERADMIN
    ) {
      return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
        message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      });
    } //end of check
    try {
      const user = await AdminService.updateAdmin(accountId, admin);
      apiResponse.result(
        res,
        { message: "success", admin: user },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error("[adminController.updateAdmin]" + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  public static async getAdmin(req, res) {
    const { adminId } = req.body;
    try {
      const admin = await AdminService.findAdminById(adminId);
      return apiResponse.result(res, admin, httpStatusCodes.OK);
    } catch (e) {
      logger.error("[adminController.getAdmin]:" + e.toString());
      return apiResponse.error(res, 400, { message: e.toString() });
    }
  }

  public static async getStudents(req, res) {
    const type = req.body;
    try {
      const students = await AdminService.getAllStudents(type);
      return apiResponse.result(res, students, httpStatusCodes.OK);
    } catch (e) {
      logger.error("[adminController.getUsers]:" + e.toString());
      return apiResponse.error(res, 400, { message: e.toString() });
    }
  }

  public static async getSenseis(req, res) {
    const type = req.body;
    try {
      const senseis = await AdminService.getAllSenseis(type);
      return apiResponse.result(res, senseis, httpStatusCodes.OK);
    } catch (e) {
      logger.error("[adminController.getUsers]:" + e.toString());
      return apiResponse.error(res, 400, { message: e.toString() });
    }
  }

  public static async deleteAdmin(req, res) {
    //only superadmin
    const { adminId } = req.body;
    try {
      const admin = await AdminService.findAdminByIdAndRemove(adminId);
      return apiResponse.result(
        res,
        { message: "Successfullly deleted" },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error("[adminController.deleteAdmin]:" + e.toString());
      return apiResponse.error(res, 400, { message: e.toString() });
    }
  }
}

/*

delete: (req, res, next) => {
    let subscriberId = req.params.id;
    Subscriber.findByIdAndRemove(subscriberId)
    .then(() => {
    res.locals.redirect = "/subscribers";
    next();
    })
    .catch(error => {
    console.log(`Error deleting subscriber by ID:
    ➥ ${error.message}`);
    next();
    });
    }

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

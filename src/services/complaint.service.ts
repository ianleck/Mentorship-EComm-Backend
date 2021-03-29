import { COMPLAINT_TYPE_ENUM } from '../constants/enum';
import { COMMENT_ERRORS, COMPLAINT_ERRORS } from '../constants/errors';
import { Comment } from '../models/Comment';
import { Complaint } from '../models/Complaint';
import { ComplaintReason } from '../models/ComplaintReason';

export default class ComplaintService {
  // ======================================== COMPLAINT REASON ========================================
  public static async createComplaintReason(complaintReason: {
    reason: string;
    description: string;
  }): Promise<ComplaintReason> {
    const { reason, description } = complaintReason;
    const existingReason = await ComplaintReason.findOne({
      where: {
        reason,
      },
    });
    if (existingReason)
      throw new Error(COMPLAINT_ERRORS.COMPLAINT_REASON_EXISTS);
    const newReason = new ComplaintReason(complaintReason);
    return newReason.save();
  }

  public static async getComplaintReasons(): Promise<ComplaintReason[]> {
    return await ComplaintReason.findAll();
  }
  // =================================================== COMMENTS ===================================================
  public static async createCommentComplaint(
    commentId: string,
    accountId: string,
    complaintReasonId: string
  ): Promise<Complaint> {
    const comment = await Comment.findByPk(commentId);
    if (!comment) throw new Error(COMMENT_ERRORS.COMMENT_MISSING);
    const existingComplaint = await Complaint.findOne({
      where: {
        commentId,
        accountId,
      },
    });

    if (existingComplaint)
      throw new Error(COMPLAINT_ERRORS.COMPLAINT_ALREADY_EXISTS);

    const newComplaint = new Complaint({
      commentId,
      complaintReasonId,
      accountId,
      type: COMPLAINT_TYPE_ENUM.COMMENT,
    });

    return newComplaint.save();
  }

  public static async resolveComplaint(complaintId: string): Promise<void> {
    const complaint = await Complaint.findByPk(complaintId);
    if (!complaint) throw new Error(COMPLAINT_ERRORS.COMPLAINT_MISSING);

    await complaint.update({
      isResolved: true,
    });
  }

  public static async getComplaintsByFilter(filter: {
    accountId?: string;
    commentId?: string;
    complaintReasonId?: string;
    isResolved?: boolean;
    type: COMPLAINT_TYPE_ENUM;
  }): Promise<Complaint[]> {
    return Complaint.findAll({
      where: filter,
      include: [Comment],
    });
  }
}

import { traineeBasicInfoModel } from "../../../../Database/models/traineeBasicInfo.model.js";
import { AppError } from "../../../utils/AppError.js";
import { catchAsyncError } from "../../../utils/catchAsyncError.js";
import { traineeModel } from "../../../../Database/models/Trainee.model.js";
import { PackageModel } from "../../../../Database/models/Package.model.js";
import { nutritionModel } from "../../../../Database/models/nutrition.model.js";
import { WorkoutModel } from "../../../../Database/models/workout.model.js";
import { traineeDietAssessmentModel } from "../../../../Database/models/traineeDietAssessment.model.js";
import { traineeWorkoutAssessmentModel } from "../../../../Database/models/traineeWorkoutAssessment.model.js";
import { SubscriptionModel } from "../../../../Database/models/subscription.model.js";
import { conversationModel } from "../../../../Database/models/conversation.model.js";

const PACKAGE_TYPES = {
  NUTRITION_WORKOUT: "Nutrition & Workout Plan",
  NUTRITION: "Nutrition Plan",
  WORKOUT: "Workout Plan",
};

async function createPackageModel(
  Model,
  id,
  traineeId,
  packageduration,
  planName = "",
  status = "First"
) {
  const modelData = {
    trainer: id,
    trainee: traineeId,
    duration: packageduration,
    status: status,
  };

  if (Model === nutritionModel && planName) {
    modelData.planName = planName;
  }

  const modelInstance = new Model(modelData);
  await modelInstance.save();
}

const handlePackageType = async (
  packageType,
  duration,
  trainerId,
  traineeId,
  traineeFullName,
  trainee,
  status
) => {
  switch (packageType) {
    case PACKAGE_TYPES.NUTRITION_WORKOUT:
      await createPackageModel(
        nutritionModel,
        trainerId,
        traineeId,
        duration,
        traineeFullName,
        status
      );
      await createPackageModel(
        WorkoutModel,
        trainerId,
        traineeId,
        duration,
        traineeFullName,
        status
      );
      //await createDietAssessment(trainerId, traineeId);
      //await createWorkoutAssessment(trainerId, traineeId);
      break;
    case PACKAGE_TYPES.NUTRITION:
      await createPackageModel(
        nutritionModel,
        trainerId,
        traineeId,
        duration,
        traineeFullName,
        status
      );
      trainee.dietAssessmentStatus = "Pending";
      await trainee.save();
      const existingPlan = await nutritionModel.updateMany(
        { trainee: traineeId, status: "Current" },
        { status: "Archived" },
        { new: true }
      );
      // await createPackageModel(
      //   traineeDietAssessmentModel,
      //   trainerId,
      //   traineeId
      // );

      break;
    case PACKAGE_TYPES.WORKOUT:
      await createPackageModel(
        WorkoutModel,
        trainerId,
        traineeId,
        duration,
        traineeFullName,
        status
      );
      //await createWorkoutAssessment(trainerId, traineeId);
      break;
    default:
      console.log("Unknown package type.");
  }
};

// // const createDietAssessment = async (trainerId, traineeId) => {
// //   const traineeBasicInfo = await traineeBasicInfoModel.findOne({
// //     trainee: traineeId,
// //   });

// //   if (!traineeBasicInfo) {
// //     console.log("Trainee basic info not found.");
// //     return;
// //   }

// //   const { gender, birthDate, weight, height, fitnessGoals, activityLevel } =
// //     traineeBasicInfo;

// //   const macros = await calculateMacronutrients(traineeBasicInfo.toObject());

// //   const AssessmentData = {
// //     trainer: trainerId,
// //     trainee: traineeId,
// //     gender,
// //     birthDate,
// //     weight,
// //     height,
// //     fitnessGoals,
// //     activityLevel,
// //     macros: macros.macros,
// //   };

// //   let dietAssessment = await traineeDietAssessmentModel.findOne({
// //     trainee: traineeId,
// //   });

// //   if (dietAssessment) {
// //     await traineeDietAssessmentModel.findOneAndUpdate(
// //       { trainee: traineeId },
// //       { $set: AssessmentData },
// //       { new: true }
// //     );
// //   } else {
// //     dietAssessment = new traineeDietAssessmentModel(AssessmentData);
// //     await dietAssessment.save();
// //   }
// //   await traineeModel.findByIdAndUpdate(traineeId, {
// //     traineeDietAssessment: dietAssessment._id,
// //   });

// //   // const nutritionAssessmentData = {
// //   //   trainer: trainerId,
// //   //   trainee: traineeId,
// //   //   gender,
// //   //   birthDate,
// //   //   weight,
// //   //   height,
// //   //   fitnessGoals,
// //   //   activityLevel,
// //   //   planmacros: macros.macros,
// //   // };

// //   // let nutritionAssessment = await nutritionModel.findOne({
// //   //   trainee: traineeId,
// //   // });

// //   // if (nutritionAssessment) {
// //   //   await nutritionModel.findOneAndUpdate(
// //   //     { trainee: traineeId },
// //   //     { $set: nutritionAssessmentData },
// //   //     { new: true }
// //   //   );
// //   // } else {
// //   //   nutritionAssessment = new nutritionModel(nutritionAssessmentData);
// //   //   await nutritionAssessment.save();
// //   // }
// // };

// // const createWorkoutAssessment = async (trainerId, traineeId) => {};

// const calculateMacronutrients = async (trainee) => {
//   // Macronutrient ratios
//   const proteinRatio = 0.3;
//   const fatRatio = 0.25;
//   const carbRatio = 0.45;

//   const caloriesPerGramProtein = 4;
//   const caloriesPerGramCarb = 4;
//   const caloriesPerGramFat = 9;
//   //console.log("Calculating macronutrients for:", trainee);
//   const birthDate = new Date(trainee.birthDate);
//   const today = new Date();
//   let age = today.getFullYear() - birthDate.getFullYear();
//   const m = today.getMonth() - birthDate.getMonth();
//   if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
//     age--;
//   }
//   //console.log("Calculated age:", age);
//   let BMR;
//   if (trainee.gender === "Male") {
//     BMR = 10 * trainee.weight + 6.25 * trainee.height - 5 * age + 5;
//   } else {
//     BMR = 10 * trainee.weight + 6.25 * trainee.height - 5 * age - 161;
//   }
//   //console.log("Calculated BMR:", BMR);
//   const activityFactors = {
//     "Extremely Active": 1.9,
//     "Very Active": 1.725,
//     "Moderate Active": 1.55,
//     "Lightly Active": 1.375,
//     Inactive: 1.2,
//   };
//   let TDEE = BMR * (activityFactors[trainee.activityLevel] || 1);
//   //console.log("TDEE before adjustment:", TDEE);

//   switch (trainee.fitnessGoals) {
//     case "Lose Weight":
//       TDEE -= 300;
//       break;
//     case "Build Muscle":
//       TDEE += 300;
//       break;
//   }

//   if (TDEE < BMR) {
//     TDEE = BMR;
//   }

//   //console.log("Final TDEE:", TDEE);

//   const dailyProtein = (TDEE * proteinRatio) / caloriesPerGramProtein;
//   const dailyFat = (TDEE * fatRatio) / caloriesPerGramFat;
//   const dailyCarbs = (TDEE * carbRatio) / caloriesPerGramCarb;

//   // console.log("Macronutrients:", {
//   //   protein: dailyProtein,
//   //   fat: dailyFat,
//   //   carbs: dailyCarbs,
//   // });
//   return {
//     macros: {
//       calories: Math.round(TDEE),
//       proteins: Math.round(dailyProtein),
//       fats: Math.round(dailyFat),
//       carbs: Math.round(dailyCarbs),
//     },
//   };
// };

////////////////////////////////////////////////////////////////////////
/////////////////////////

const getTrainerpackages = catchAsyncError(async (req, res, next) => {
  const traineeId = req.user.payload.id;
  const id = req.params.id;
  const data = await PackageModel.find({
    trainerId: id,
    active: true,
  }).select("packageName price description duration packageType");
  if (!data) {
    return next(new AppError("data not found", 404));
  }
  const traineeStatus = await traineeModel
    .find({
      _id: traineeId,
    })
    .select("status");
  res.status(201).json({
    success: true,
    // message: " success",
    data: data,
    traineeStatus,
  });
});

const selectPackage = catchAsyncError(async (req, res, next) => {
  const traineeId = req.user.payload.id;
  const packageId = req.params.id;

  const Packageselected = await PackageModel.findById(packageId);
  if (!Packageselected) {
    return next(new AppError("Package not found", 404));
  }
  const activeSubscriptionsCount =
    await Packageselected.countActiveSubscriptions();

  if (activeSubscriptionsCount >= Packageselected.subscribersLimit) {
    return res.status(403).json({
      message: "Subscribers limit reached for this package.",
    });
  }

  const selectedPackage = await PackageModel.findByIdAndUpdate(
    { _id: packageId, traineeIds: { $ne: traineeId } },
    { $addToSet: { traineeIds: traineeId } },
    { new: true, runValidators: true }
  );
  // const traineepackage = await traineeModel
  //   .findById(traineeId)
  //   .populate("package");
  const trainee = await traineeModel.findByIdAndUpdate(traineeId, {
    package: packageId,
    assignedTrainer: selectedPackage.trainerId,
  });

  //trainee.package = packageId;
  //trainee.assignedTrainer = selectedPackage.trainerId;
  await trainee.save();
  if (!selectedPackage) {
    return next(new AppError("Error updating package with trainee", 500));
  }

  res.status(200).json({
    success: true,
    data: {
      selectedPackage,
      trainee,
    },
  });
});

const getTrainerAndPackageDetails = catchAsyncError(async (req, res, next) => {
  const traineeId = req.user.payload.id;
  const trainee = await traineeModel
    .findById(traineeId)
    .select("assignedTrainer package")
    .populate({
      path: "package",
      select: "packageType duration -_id price ",
    })
    .populate({
      path: "assignedTrainer",
      select: "firstName lastName profilePhoto _id",
    });
  if (!trainee || !trainee.assignedTrainer || !trainee.package) {
    res.status(200).json({
      success: true,
      data: null,
    });
  }

  const trainerFullName = `${trainee.assignedTrainer.firstName} ${trainee.assignedTrainer.lastName}`;
  const { profilePhoto } = trainee.assignedTrainer;
  const { packageType, duration } = trainee.package;
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + duration);
  const dateOptions = { year: "numeric", month: "long", day: "numeric" };
  const formattedDuration = `${duration} month${duration === 1 ? "" : "s"}`;

  res.status(200).json({
    success: true,
    data: {
      trainerName: trainerFullName,
      trainerId: trainee.assignedTrainer._id,
      profilePhoto,
      SubscriptionType: packageType,
      paidAmount: trainee.package.price,
      Duration: formattedDuration,
      startDate: startDate.toLocaleDateString("en-US", dateOptions),
      endDate: endDate.toLocaleDateString("en-US", dateOptions),
    },
  });
});

const subscribeWithTrainer = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const traineeId = req.user.payload.id;
  const trainee = await traineeModel
    .findById(traineeId)
    .populate("assignedTrainer package");
  if (!trainee) {
    return next(new AppError("Trainee not found", 404));
  }
  const traineeFullName = `${trainee.firstName} ${trainee.lastName}`;
  trainee.assignedTrainer = id;
  trainee.status = "subscriber";
  await trainee.save();
  const { packageType, duration, _id } = trainee.package;
  await handlePackageType(
    packageType,
    duration,
    id,
    traineeId,
    traineeFullName,
    trainee
  );
  await SubscriptionModel.findOneAndUpdate(
    {
      traineeId: traineeId,
      trainerId: id,
      traineeSubscriptionStatus: "Current",
    },
    { traineeSubscriptionStatus: "Archived" }
  );
  const newSubscription = new SubscriptionModel({
    trainerId: id,
    traineeId: traineeId,
    package: _id,
    status: "Active",
    paidAmount: req.body.paidAmount,
  });
  await newSubscription.save();

  // Create a new conversation
  const conversation = new conversationModel({
    participants: [
      { participantId: traineeId, participantModel: "Trainee" },
      { participantId: id, participantModel: "Trainer" },
    ],
  });

  await conversation.save();
  res.status(200).json({
    success: true,
    //message: "Subscription successful",
    message: "Fill Assessment",
  });
});

const cancelSubscription = catchAsyncError(async (req, res, next) => {
  const traineeId = req.user.payload.id;
  const trainee = await traineeModel
    .findById(traineeId)
    .populate("assignedTrainer package");

  if (!trainee) {
    return next(new AppError("Trainee not found", 404));
  }

  const { package: packageId, assignedTrainer: trainerId } = trainee;
  const selectedPackage = await PackageModel.findById(packageId);

  if (selectedPackage) {
    selectedPackage.traineeIds = selectedPackage.traineeIds.filter(
      (id) => id.toString() !== traineeId
    );
    await selectedPackage.save();
  }

  trainee.status = "non-subscriber";
  trainee.assignedTrainer = null;
  trainee.package = null;
  trainee.dietAssessmentStatus = "Not Allowed";
  trainee.workoutAssessmentStatus = "Not Allowed";
  await trainee.save();

  await traineeDietAssessmentModel.findOneAndUpdate(
    { trainee: traineeId, status: "Current" },
    { status: "Archived" }
  );
  // await nutritionModel.findOneAndUpdate(
  //   { trainee: traineeId, status: "Current" },
  //   { status: "Last" }
  // );
  // await WorkoutModel.findOneAndUpdate(
  //   { trainee: traineeId, status: "Current" },
  //   { status: "Last" }
  // );
  await traineeWorkoutAssessmentModel.findOneAndUpdate(
    { trainee: traineeId, status: "Current" },
    { status: "Archived" }
  );

  await SubscriptionModel.findOneAndUpdate(
    { traineeId, trainerId, package: packageId, status: "Active" },
    { status: "Cancelled" }
  );

  res.status(200).json({
    success: true,
    message: "Subscription canceled ",
  });
});

export {
  selectPackage,
  getTrainerpackages,
  getTrainerAndPackageDetails,
  subscribeWithTrainer,
  cancelSubscription,
};

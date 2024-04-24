import { AppError } from "../../utils/AppError.js";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { foodModel } from "../../../Database/models/food.model.js";
import { determineFolderName } from "../../multer/multer.js";
import { uploadImageToCloudinary } from "../../utils/cloudinary.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";

async function handleFoodImageUpload(user, file) {
  const folderName = determineFolderName({ user }, "foodImage");
  const uploadResult = await uploadImageToCloudinary(file, folderName);
  if (uploadResult) {
    return {
      photoUrl: uploadResult.url,
    };
  } else {
    throw new Error("Failed to upload image");
  }
}
const addFood = catchAsyncError(async (req, res, next) => {
  const {
    foodname,
    baseMacro,
    servingUnit,
    category,
    foodAllergens,
    diseaseCompatibility,
    description,
    per,
    dietType,
    mealtype,
    religionrestriction,
  } = req.body;
  const macros = {
    calories: req.body["macros.calories"],
    proteins: req.body["macros.proteins"],
    fats: req.body["macros.fats"],
    carbs: req.body["macros.carbs"],
  };

  let foodImage = null;

  if (req.file) {
    const uploadResult = await handleFoodImageUpload(req.user, req.file);
    if (uploadResult) {
      foodImage = uploadResult.photoUrl;
    } else {
      return next(new Error("Failed to upload image"));
    }
  }

  let Trainer, admin;
  if (req.user.payload.role === "trainer") {
    Trainer = req.user.payload.id;
  } else {
    admin = req.user.payload.id;
  }

  const data = new foodModel({
    foodname,
    foodImage,
    macros,
    baseMacro,
    servingUnit,
    category,
    foodAllergens,
    diseaseCompatibility,
    description,
    per,
    dietType,
    mealtype,
    religionrestriction,
    Trainer,
    admin,
  });

  await data.save();

  res.status(200).json({
    success: true,
    message: "Food added successfully",
    data,
  });
});

const updateFood = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  let data = await foodModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!data) {
    return next(new Error("Food item not found"));
  }
  if (req.file) {
    const uploadResult = await handleFoodImageUpload(req.user, req.file);
    if (uploadResult) {
      data.foodImage = uploadResult.photoUrl;
    } else {
      return next(new Error("Failed to upload new image"));
    }
  }
  Object.assign(data, req.body);
  await data.save();
  res.status(200).json({
    success: true,
    message: "Food updated successfully",
    data,
  });
});
const getTrainerFood = catchAsyncError(async (req, res, next) => {
  const id = req.user.payload.id;
  let apiFeatures = new ApiFeatures(foodModel.find({ Trainer: id }), req.query)
    .paginate()
    .fields()
    .filter()
    .sort()
    .search();
  let data = await apiFeatures.mongoooseQuery;
  if (!data) {
    return next(new AppError(" data not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "success",
    page: apiFeatures.PAGE_NUMBER,
    data,
  });
});
const getFood = catchAsyncError(async (req, res, next) => {
  let apiFeatures = new ApiFeatures(
    foodModel.find({ Trainer: null }),
    req.query
  )
    .paginate()
    .fields()
    .filter()
    .sort()
    .search();
  let data = await apiFeatures.mongoooseQuery;
  if (!data) {
    return next(new AppError(" data not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "success",
    page: apiFeatures.PAGE_NUMBER,
    data,
  });
});
const getSpecificFood = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const data = await foodModel.findById(id);
  if (!data) {
    return next(new AppError(" data not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "success",
    data,
  });
});
const deleteFood = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const data = await foodModel.findByIdAndDelete(id);
  if (!data) {
    return next(new AppError(" data not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Food deleted successfully",
    data,
  });
});

export {
  addFood,
  updateFood,
  getTrainerFood,
  getFood,
  getSpecificFood,
  deleteFood,
};
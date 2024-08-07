import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const nutritionSchema = new Schema(
  {
    planName: {
      type: String,
      required: [false, "Plan Name is required"],
    },
    trainer: {
      type: Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    trainee: {
      type: Schema.Types.ObjectId,
      ref: "Trainee",
      required: false,
    },
    ///////////////////////
    gender: {
      type: String,
      enum: ["Male", "Female"],
      // default: "Male",
    },
    birthDate: {
      type: Date,
    },
    weight: {
      type: Number,
    },
    height: {
      type: Number,
    },
    fitnessGoals: {
      type: String,
      enum: ["Lose Weight", "Build Muscle", "Healthy Lifestyle"],
    },
    activityLevel: {
      type: String,
      enum: [
        "Extremely Active",
        "Very Active",
        "Moderate Active",
        "Lightly Active",
        "In active",
      ],
    },
    ////////////////////////////////
    daysCount: {
      type: Number,
      min: 1,
      required: false,
    },
    foodAllergens: {
      type: [String],
      enum: [
        "Milk",
        "Eggs",
        "Fish",
        "Shellfish",
        "Tree Nuts",
        "Peanuts",
        "Wheat",
        "Soybeans",
        "Corn",
        "Gelatin",
        "Beef",
        "Chicken",
        "Mutton",
        "Sesame",
        "Sunflower",
        "Poppy",
        "Citrus",
        "Strawberries",
        "Bananas",
        "Garlic",
        "Onions",
        "Coriander",
        "Mustard",
        "Oats",
        "Rye",
      ],
    },

    disease: {
      type: [String],
      enum: [
        "Diabetes Type 1",
        "Diabetes Type 2",
        "Celiac Disease",
        "Irritable Bowel Syndrome",
        "Lactose Intolerance",
        "Hypertension",
        "Hyperlipidemia",
        "Gout",
        "Osteoporosis",
        "Kidney Disease",
        "Heart Disease",
        "Gastroesophageal Reflux Disease",
        "Obesity",
        "Anemia",
        "Polycystic Ovary Syndrome",
        "Thyroid Disorders",
      ],
    },

    religionrestriction: {
      type: [String],
      enum: ["alcohol", "pork", "carrion", "Beef", " meat products"],
    },

    dietType: {
      type: String,
      enum: [
        "Vegetarian",
        "Vegan",
        "Ketogenic",
        "Paleo",
        "Mediterranean",
        "Standard",
        "Other",
      ],
      required: false,
    },
    numberofmeals: {
      type: Number,
      min: 1,
      required: false,
    },
    goal: {
      type: String,
      required: false,
    },
    duration: {
      type: Number,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    numberOfWeeks: {
      type: Number,
      required: false,
    },
    startDate: {
      type: Date,
      required: false,
    },
    days: [
      {
        startDate: {
          type: Date,
          required: false,
        },
        day: {
          type: String,
          required: false,
        },
        meals: [
          {
            mealname: {
              type: String,
              required: [false, "Meal Name is required"],
            },
            mealtype: {
              type: String,
              enum: ["Breakfast", "Lunch", "Snack", "Dinner"],
              required: false,
            },
            mealnote: {
              type: String,
            },
            foods: [
              {
                food: { type: Schema.ObjectId, ref: "food" },
                amount: {
                  type: Number,
                  default: 1,
                },
                foodname: {
                  type: String,
                  required: [false, "Food Name is required"],
                },
                foodImage: {
                  type: String,
                  required: [false, "Food Image is required"],
                },
                servingUnit: {
                  type: String,
                  enum: ["Gram", "Scoop", "Piece", "Mili", "Spoon", "Cup"],
                  default: "Gram",
                },
                consumed: {
                  type: Boolean,
                  default: false,
                },
                macros: {
                  calories: { type: Number, min: 0 },
                  proteins: { type: Number, min: 0 },
                  fats: { type: Number, min: 0 },
                  carbs: { type: Number, min: 0 },
                },
              },
            ],
            mealmacros: {
              calories: { type: Number, min: 0 },
              proteins: { type: Number, min: 0 },
              fats: { type: Number, min: 0 },
              carbs: { type: Number, min: 0 },
            },
          },
        ],
        mealsCount: {
          type: Number,
        },
        daymacros: {
          calories: { type: Number, default: 0 },
          proteins: { type: Number, default: 0 },
          fats: { type: Number, default: 0 },
          carbs: { type: Number, default: 0 },
        },
        eatenDaysMacros: {
          calories: { type: Number, default: 0 },
          proteins: { type: Number, default: 0 },
          fats: { type: Number, default: 0 },
          carbs: { type: Number, default: 0 },
        },
      },
    ],
    planmacros: {
      calories: { type: Number, default: 0 },
      proteins: { type: Number, default: 0 },
      fats: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
    },
    targetmacros: {
      calories: { type: Number, default: 0 },
      proteins: { type: Number, default: 0 },
      fats: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
    },
    plantype: {
      type: String,
      enum: ["Free plan", "Customized plan", "My plan"],
      default: "Customized plan",
    },
    published: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Current", "First", "Archived"],
      default: "Current",
    },
    originalPlan: {
      type: Schema.Types.ObjectId,
      ref: "nutrition",
      required: false,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

nutritionSchema.virtual("isFavorite", {
  ref: "FavoriteDietPlan",
  localField: "_id",
  foreignField: "dietPlan",
  justOne: false,
  count: true,
});

async function calculateFreePlanSubscribers(originalPlanId) {
  try {
    const subscribers = await nutritionModel.aggregate([
      {
        $match: {
          originalPlan: new mongoose.Types.ObjectId(originalPlanId),
          plantype: "Free plan",
          trainee: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$trainee",
        },
      },
      {
        $count: "subscribersCount",
      },
    ]);

    return subscribers.length > 0 ? subscribers[0].subscribersCount : 0;
  } catch (error) {
    console.error("Error calculating free plan subscribers:", error);
    throw error;
  }
}

export { calculateFreePlanSubscribers };

export const nutritionModel = model("nutrition", nutritionSchema);

// numberofdays: {
//   type: Number,
//   min: 1,
//   required: false,
// },

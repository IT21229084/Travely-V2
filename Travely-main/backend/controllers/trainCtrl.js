// npm install express-session
// npm install express multer express-validator mongoose

const { body, validationResult } = require('express-validator');
const multer = require("multer");
const Train = require("../models/Train");
const path = require("path");

const storage = multer.diskStorage({
    destination : (req,file,cb)=> {
        cb(null,"images")
    },
    filename : (req,file,cb)=>{
        console.log(file);
        cb(null,Date.now()+path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Only image files are allowed!'));
      }
      cb(null, true);
    }
  }).fields([
    { name: 'trainMainImg', maxCount: 1 }
  ]);

// add a train admin
//const addTrain = async(req,res)=>{
//    try {
//        upload(req,res,async(err)=>{
//            if(err){
//                console.log(err.message);
//                return res.status(500).json({message:"error in uploading"})
//            }
//
//            const newTrain = new Train({
//                ...req.body,
//               // trainMainImg : req.files.trainMainImg[0].filename
//            })
//
//            await newTrain.save();
//            res.status(200).json(newTrain);
//        });
//    } catch(err){
//        console.log(err);
//        res.status(500).json({message : err.message})
//    }
//}

// Add a train (admin)
const addTrain = [
    // Validation and sanitization of inputs
    body('trainName').trim().escape().notEmpty().withMessage('Train name is required.'),
    body('from').trim().escape().notEmpty().withMessage('Origin is required.'),
    body('to').trim().escape().notEmpty().withMessage('Destination is required.'),
    body('arrivalTime').trim().escape().notEmpty().withMessage('Arrival time is required.'),
    body('departureTime').trim().escape().notEmpty().withMessage('Departure time is required.'),
    body('date').trim().escape().isISO8601().withMessage('Valid date is required.'),
    body('price').trim().escape().isNumeric().withMessage('Price must be a number.'),
    body('noOfSeats').trim().escape().isInt({ min: 1, max: 100 }).withMessage('Number of seats must be a positive integer and cannot exceed 100.'),
    body('description').trim().escape().notEmpty().withMessage('Description is required.'),
    body('MaxBagage').trim().escape().isInt({ min: 0 }).withMessage('Max baggage must be a non-negative integer.'),
    body('classType').trim().escape().notEmpty().withMessage('Class type is required.'),
    body('cancelCharges').trim().escape(),

    async (req, res) => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors.array()); // Log the validation errors for debugging
                return res.status(400).json({ errors: errors.array() });
            }

            // CSRF token validation
            const csrfToken = req.headers['csrf-token'];
            // Implement CSRF validation logic 

            upload(req, res, async (err) => {
                if (err) {
                    console.log(err.message);
                    return res.status(500).json({ message: "Error in uploading" });
                }

                // Create a new train with sanitized inputs
                const noOfSeats = parseInt(req.body.noOfSeats, 10); // Ensure noOfSeats is an integer
                if (noOfSeats > 100) {
                    return res.status(400).json({ message: "Number of seats cannot exceed 100." });
                }

                const newTrain = new Train({
                    trainName: req.body.trainName,
                    from: req.body.from,
                    to: req.body.to,
                    arrivalTime: req.body.arrivalTime,
                    departureTime: req.body.departureTime,
                    date: req.body.date,
                    price: parseFloat(req.body.price), // Ensure price is a number
                    noOfSeats: noOfSeats, // Use the validated noOfSeats
                    description: req.body.description,
                    trainMainImg: req.files?.trainMainImg[0]?.filename || null, 
                    MaxBagage: parseInt(req.body.MaxBagage, 10), // Ensure MaxBagage is an integer
                    classType: req.body.classType,
                    cancelCharges: req.body.cancelCharges
                });

                // Save the new train to the database
                await newTrain.save();
                res.status(200).json(newTrain);
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: err.message });
        }
    }
];


// get all trains admin -- just for now
const getAllTrains = async(req,res)=>{
    await Train.find().then((trains)=>{
        res.json(trains);
    }).catch((err)=>{
        res.send(err.message);
    })
}

// get one trains
const getSingleTrain = async (req,res)=>{
    const id = req.params.id;

    const train = await Train.findById(id).then((train)=>{
        res.json(train);
    }).catch((err)=>{
        res.json(err.message)
    })
}

// delete train  - admin
const deleteTrain = async(req,res)=>{
    const id = req.params.id;

    await Train.findByIdAndDelete(id).then(()=>{
        res.json("deleted");
    }).catch((err)=>{
        res.json(err.message);
    })
}


// update train -admin
const updateTrain = async(req,res)=>{
    const id = req.params.id;

    const {trainName,from,to,arrivalTime,depatureTime,date,price,
        noOfSeats ,description,trainMainImg,MaxBagage,classType,cancelCharges} = req.body;
    
    const updatedTrain = {trainName,from,to,arrivalTime,depatureTime,date,price,
        noOfSeats ,description,trainMainImg,MaxBagage,classType,cancelCharges
    }

    await Train.findByIdAndUpdate(id,updatedTrain).then(()=>{
        //const fetehced =  Train.findById(id);
        res.json({status : "Updated",train:updatedTrain});
    }).catch((err)=>{
        res.json(err.message);
    })
    
}

// fetch trains by from and To of searh component
const getTrainFromTo =  async (req,res) =>{
    const {from,to} = req.params;
    try{
        const trains = await Train.find({from : from , to : to})
        if(!trains){
            res.status(404).send("no trains");
        }
        res.send(trains)
    }catch(err){
        res.status(500).send(err.message);
    }
}

module.exports= {
    addTrain,
    getAllTrains,
    getSingleTrain,
    deleteTrain,
    updateTrain,
    getTrainFromTo
}

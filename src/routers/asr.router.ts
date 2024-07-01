import { Router, Request, Response } from 'express';
// import * as sql from 'mssql';
const sql = require('mssql/msnodesqlv8');
const router = Router();
import Joi, { Schema, ValidationResult } from 'joi';

// create interface for a Categorys object
interface Categorys {
  CategoryID: number;
  FromDate: Date;
  ToDate: Date;
  PercentageValue: number;
  UpdatedBy: string;
}

// Define Joi schama for validation purposes
const CategorySchema: Schema = Joi.object({
  CategoryID: Joi.number().required(),
  FromDate: Joi.date().required(),
  ToDate: Joi.date(),
  PercentageValue: Joi.number().precision(1).required(),
  UpdatedBy: Joi.string().required(),
});
// CategoryName: string;
// CategoryDescription: string;

// const sqlConfig: sql.config = {
//   server: 'DESKTOP-A2VP9VB\\MSSQLSERVER2022',
//   database: 'DAP',
//   options: {
//     trustedConnection: true,
//     // port: 1433, // Update the port number if needed
//   },
// };

var sqlConfig = {
  server: `DESKTOP-A2VP9VB\\MSSQLSERVER2022`, // eg:: 'DESKTOP_mjsi\\MSSQLEXPRESS'
  databse: 'DAP',
  // user: 'sa', // please read above note
  // password: 'your password', // please read above note
  options: {
    trustedConnection: true,
  },
  driver: 'msnodesqlv8',
};

/**
 * @swagger
 * /asr/category:
 *  get:
 *    description: Use to request all category
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get('/category', (req: Request, res: Response) => {
  sql.connect(sqlConfig, function (err: any) {
    if (err) console.log(err);
    // make a request as
    var request = new sql.Request();
    //make the query
    var query =
      'SELECT TOP (1000) [CategoryID],[CategoryName] FROM [DAP].[dbo].[Category]'; // eg : "select * from tbl_name"
    request.query(query, function (err: any, records: any[]) {
      if (err) console.log(err);
      else {
        console.log(records);
        res.json(records);
        //  your out put as records
      }
    });
  });
});

/**
 * @swagger
 * /asr/category-details:
 *  get:
 *    description: Use to request all category-details
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get('/category-details', (req: Request, res: Response) => {
  sql.connect(sqlConfig, function (err: any) {
    if (err) console.log(err);
    // make a request as
    var request = new sql.Request();
    //make the query
    var query =
      'SELECT C.CategoryID, C.CategoryName, CD.FromDate, CD.ToDate, CD.PercentageValue, CD.LastUpdated, CD.UpdatedBy FROM [DAP].[dbo].Category as C JOIN [DAP].[dbo].CategoryDetails as CD ON C.CategoryID = CD.CategoryID';

    request.query(query, function (err: any, records: any[]) {
      if (err) console.log(err);
      else {
        console.log(records);
        res.json(records);
        //  your out put as records
      }
    });
  });
});

// Insert values using the stored procedure
// async function insertCategoryDetails(
//   categoryID: any,
//   fromDate: any,
//   toDate: any,
//   percentageValue: any,
//   updatedBy: any,
//   req: Request,
//   res: Response
// ) {
//   try {
//     console.log('category-details Start2');
//     await sql.connect(sqlConfig);
//     const request = new sql.Request();

//     console.log('category-details Start3');

//     // Set the input parameters for the stored procedure
//     request.input('CategoryID', sql.BigInt, categoryID);
//     request.input('FromDate', sql.DateTime, fromDate);
//     request.input('ToDate', sql.DateTime, toDate);
//     request.input('PercentageValue', sql.Decimal(5, 1), percentageValue);
//     request.input('UpdatedBy', sql.NVarChar(50), updatedBy);

//     // Execute the stored procedure
//     const result = await request.execute('DAP.dbo.sp_CategoryDetails');
//     console.log('Values inserted successfully.', result);
//     res.json({ records: result });
//   } catch (error) {
//     console.error('Error inserting values:', error);
//   } finally {
//     sql.close();
//   }
// }

/**
 * @swagger
 * /asr/category-details:
 *  post:
 *    description: Use to insert category details
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - CategoryID
 *              - FromDate
 *              - ToDate
 *              - PercentageValue
 *              - UpdatedBy
 *            properties:
 *              CategoryID:
 *                type: number
 *                default: 5
 *                description: The category ID
 *              FromDate:
 *                type: string
 *                format: date
 *                default: '2022-01-01'
 *                description: The start date
 *              ToDate:
 *                type: string
 *                format: date
 *                default: '2022-12-31'
 *                description: The end date
 *              PercentageValue:
 *                type: number
 *                default: 99.0
 *                description: The amount
 *              UpdatedBy:
 *                type: string
 *                default: 'Devesh Doe'
 *                description: The name
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.post('/category-details', async (req: Request, res: Response) => {
  console.log('category-details Start');

  try {
    await sql.connect(sqlConfig);
    const request = new sql.Request();
    console.log('req.body', req.body);

    const { error }: ValidationResult<Categorys> = CategorySchema.validate(
      req.body
    );

    if (error) {
      return res.status(400).json({
        message: 'Bad Request',
        errors: error.details[0].message,
      });
    }

    const temp = {
      CategoryID: req.body.CategoryID,
      FromDate: req.body.FromDate,
      ToDate: req.body.ToDate,
      PercentageValue: req.body.PercentageValue,
      UpdatedBy: req.body.UpdatedBy,
    };

    // Set the input parameters for the stored procedure
    request.input('CategoryID', sql.BigInt, temp.CategoryID);
    request.input('FromDate', sql.DateTime, temp.FromDate);
    request.input('ToDate', sql.DateTime, temp.ToDate);
    request.input('PercentageValue', sql.Decimal(5, 1), temp.PercentageValue);
    request.input('UpdatedBy', sql.NVarChar(50), temp.UpdatedBy);

    // Execute the stored procedure
    const result = await request.execute('DAP.dbo.sp_CategoryDetails');
    console.log('Values inserted successfully.', result);

    res.json({
      message: 'Category details inserted successfully.',
      records: result,
    });

    // res.json({ records: result });
  } catch (error) {
    console.error('Error inserting values:', error);
  } finally {
    sql.close();
  }

  // insertCategoryDetails(
  //   5,
  //   '2022-01-01',
  //   '2022-12-31',
  //   99.0,
  //   'Devesh Doe',
  //   req,
  //   res
  // );
  // res.json({ records: 'records' });
});

router.post('/home', (req: Request, res: Response) => {
  console.log('category-details Start');
});

export default router;

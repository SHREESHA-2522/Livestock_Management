const express = require("express");
var mysql = require("mysql");
// const fs = require('fs');
const nodemailer = require("nodemailer");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());

// Parse application/x-www-form-urlencoded requests
app.use(bodyParser.urlencoded({ extended: true }));
const connection = require("./db.js");
// const { error } = require("console");

app.post("/adminlogin", (req, res) => {
  const sql = "SELECT * FROM admin WHERE `email` = ? AND `password` = ?";
  const values = [req.body.email, req.body.password];

  connection.query(sql, values, (err, data) => {
    if (err) {
      console.error("Error querying data:", err);
      return res.json("Error");
    }
    if (data.length > 0) {
      return res.json("Success");
    } else {
      return res.json("Fail");
    }
  });
});

// Endpoint to handle the purchase request
app.post("/notifyAdmin", (req, res) => {
  const { email, cowId } = req.body;
  // const message = `User with email ${email} wants to buy cow with ID ${cowId}`;

  // Insert a new record into the notification table
  connection.query(
    "INSERT INTO notifications (email,cow_id) VALUES (?,?)",
    [email, cowId],
    (error, results) => {
      if (error) {
        console.error("Error inserting notification:", error);
        res.status(500).json({ error: "Error inserting notification" });
      } else {
        res.status(200).send({ message: "Notification sent to admin" });
      }
    }
  );
});

// Endpoint to get notifications for the admin
app.get("/notifications", (req, res) => {
  connection.query("SELECT * FROM notifications", (error, results) => {
    if (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Error fetching notifications" });
    } else {
      console.log(results)
      res.status(200).json(results);
    }
  });
});

app.post("/buyCow", (req, res) => {
  const { email, x } = req.body;
  // console.log(req.body,email,x)
  connection.query("DELETE FROM notifications WHERE email = ? AND cow_id = ?;", [email, x], (error,rtesult) => {
    if (error) {
      console.error("Error inserting notification:", error);
      res.status(500).json({ error: "Error inserting notification" });
    } else {
      // console.log(rtesult)
      connection.query("DELETE FROM cattle WHERE cow_id = ?;", [x], (error,result) => {
        if (error) {
          console.log(error)
        }
        else {
          // console.log(result)
          res.status(200).send({ message: "Successfully approved the transaction!" });
        }
      })
    }
  }
  );
});

// Routes

app.post("/signup", (req, res) => {
  const sql =
    "INSERT INTO signup (`name`, `email`, `password`) VALUES (?, ?, ?)";
  const values = [req.body.name, req.body.email, req.body.password];

  connection.query(sql, values, (err, data) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.json("Error");
    }
    console.log(data);
    return res.json("Success");
  });
});

app.post("/login", (req, res) => {
  const sql = "SELECT * FROM signup WHERE `email` = ? AND `password` = ?";
  const values = [req.body.email, req.body.password];
  console.log(values);
  connection.query(sql, values, (err, data) => {
    if (err) {
      console.error("Error querying data:", err);
      return res.send({ data: null, message: "Failed" });
    }
    if (data.length > 0) {
      console.log(data[0]);
      return res.send({ data: data[0], message: "Success" });
    } else {
      console.log("FAILED")
      return res.send({ data: null, message: "Failed" });
    }
  });
});

app.post("/getData", async (req, res) => {
  try {
    const email = req.body.email;

    // Execute the query to find a document based on the email
    const query = `SELECT * FROM signup WHERE email = '${email}'`;
    db.query(query, (err, result) => {
      if (err) {
        console.error("Error retrieving data:", err);
        res.status(500).json({ message: "Internal server error" });
      } else {
        if (result.length > 0) {
          res.send({ data: result[0] }); // Send the found document as a response
        } else {
          console.log("No document found for email:", email);
          res.send({ message: "No document found for email", status: 404 });
        }
      }
    });
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  const sql = `SELECT * FROM cattle;`;
  connection.query(sql, function (err, response) {
    if (err) throw err;
    else {
      res.send(response);
    }
  });
});

app.get("/doctor_list", (req, res) => {
  const sql = `SELECT * FROM doctor;`;
  connection.query(sql, function (err, response) {
    if (err) throw err;
    else {
      res.send(response);
    }
  });
});

app.get("/employee_list", (req, res) => {
  const sql = `SELECT * FROM employee;`;
  connection.query(sql, function (err, response) {
    if (err) throw err;
    else {
      res.send(response);
    }
  });
});

app.get("/room_list", (req, res) => {
  const sql = `SELECT * FROM rooms;`;
  connection.query(sql, function (err, response) {
    if (err) throw err;
    else {
      res.send(response);
    }
  });
});

// Endpoint to add cattle details
app.post("/add_cattle", (req, res) => {
  const {
    age,
    gender,
    health,
    caretaker_id,
    doc_id,
    room_no,
    weight,
    color,
    breed,
    birth_date,
    last_vaccination,
    price,
    feed_consumed,
    profit
    ,
  } = req.body;

  const sql = `INSERT INTO cattle (age, gender, health, caretaker_id, doc_id, room_no, weight, color, breed, birth_date, last_vaccination, price,feed_consumed,profit) 
                 VALUES ('${age}', '${gender}', '${health}', '${caretaker_id}', '${doc_id}', '${room_no}', '${weight}', '${color}', '${breed}', '${birth_date}', '${last_vaccination}', '${price}','${feed_consumed}','${profit}');`;

  connection.query(sql, function (err) {
    if (err) {
      console.error("Error adding cattle:", err);
      res.status(500).send({ message: "Failed to add cattle" });
    } else {
      res.status(200).send({ message: "Cattle added successfully" });
    }
  });
});

// Endpoint to add doctor details
app.post("/add_doctor", (req, res) => {
  const { d_id, name, contact, specialization, hospital } = req.body;

  const sql = `INSERT INTO doctor (d_id,name,contact,specialization,hospital) 
                 VALUES ('${d_id}','${name}', '${contact}', '${specialization}', '${hospital}');`;

  connection.query(sql, function (err) {
    if (err) {
      console.error("Error adding doctor:", err);
      res.status(500).send({ message: "Failed to add doctor" });
    } else {
      res.status(200).send({ message: "Doctor added successfully" });
    }
  });
});

// Endpoint to add room details
app.post("/add_room", (req, res) => {
  const { room_no, water_supply, food_supply, capacity } = req.body;

  const sql = `INSERT INTO rooms (room_no,water_supply,food_supply,capacity) 
                 VALUES ('${room_no}','${water_supply}', '${food_supply}', '${capacity}');`;

  connection.query(sql, function (err) {
    if (err) {
      console.error("Error adding room:", err);
      res.status(500).send({ message: "Failed to add room" });
    } else {
      res.status(200).send({ message: "Room added successfully" });
    }
  });
});

// Endpoint to add employee details
app.post("/add_employee", (req, res) => {
  const { emp_id, name, age, address, salary, phone_no } = req.body;
  console.log(phone_no);
  const sql = `INSERT INTO employee (emp_id, name, age, address, salary, phone_no) 
                 VALUES ('${emp_id}', '${name}', '${age}', '${address}', '${salary}', '${phone_no}');`;

  connection.query(sql, function (err) {
    if (err) {
      console.error("Error adding employee:", err);
      res.status(500).send({ message: "Failed to add employee" });
    } else {
      res.status(200).send({ message: "Employee added successfully" });
    }
  });
});

app.post("/get_doctor_specific_details", (req, res) => {
  const cow_id = req.body.id;
  const sql = `SELECT * FROM doctor WHERE d_id = (SELECT doc_id FROM cattle WHERE cow_id = ?)`;
  connection.query(sql, [cow_id], function (err, response) {
    if (err) {
      console.log(err);
    } else {
      res.status(200).send(response);
    }
  });
});

app.post("/get_caretaker_specific_details", (req, res) => {
  const cow_id = req.body.id;
  const sql = `SELECT * FROM employee WHERE emp_id = (SELECT caretaker_id FROM cattle WHERE cow_id = ?)`;
  connection.query(sql, [cow_id], function (err, response) {
    if (err) {
      console.log(err);
    } else {
      res.status(200).send(response);
    }
  });
});

app.post("/get_room_specific_details", (req, res) => {
  const cow_id = req.body.id;
  console.log(cow_id);
  const sql = `SELECT * FROM rooms WHERE room_no = (SELECT room_no FROM cattle WHERE cow_id = ?)`;
  connection.query(sql, [cow_id], function (err, response) {
    if (err) {
      console.error("Error fetching room details:", err);
      res.status(500).send("Error fetching room details");
    } else {
      res.status(200).send(response);
    }
  });
});

//establishes connections
app.listen(8080, () => {
  console.log(
    "Server started at port 8080. Open in browser using localhost:8080"
  );
  connection.connect(function (err) {
    if (err) throw err;
    console.log("Database coletions");
  });
});

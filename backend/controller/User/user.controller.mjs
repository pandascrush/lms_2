import db from "../../config/db.config.mjs";
import transporter from "../../config/email.config.mjs";
import path from "path";
import moment from "moment";

export const getUserById = (req, res) => {
  const { id } = req.params; // Extract user ID from request params

  // Check if the user ID is provided
  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  // SQL query to fetch user details by ID
  db.query("SELECT * FROM user WHERE user_id = ?", [id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send back the user details as response
    res.json({ user: result[0] });
  });
};

export const getUserWorkHours = (req, res) => {
  const { id } = req.params; // Extract user ID from request params

  // Check if the user ID is provided
  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  // SQL query to fetch login/logout details for the user
  const query = `
    SELECT eventname, time_created 
    FROM standardlog 
    WHERE user_id = ?
    AND (eventname = 'login' OR eventname = 'logout')
    ORDER BY time_created ASC
  `;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "No login/logout records found for this user" });
    }

    let workHoursByDay = {};
    let lastLoginTime = null;

    // Iterate through the logs to calculate hours worked
    result.forEach((log) => {
      const eventTime = moment(log.time_created);

      if (log.eventname === "login") {
        // Store the login time
        lastLoginTime = eventTime;
      } else if (log.eventname === "logout" && lastLoginTime) {
        // Calculate hours worked if there was a preceding login
        const hoursWorked = eventTime.diff(lastLoginTime, "hours", true); // Get fractional hours
        const day = lastLoginTime.format("dddd"); // Get the day of the week
        const date = lastLoginTime.format("YYYY-MM-DD"); // Get the date

        // If the day already exists, accumulate the hours and ensure the date is tracked
        if (workHoursByDay[date]) {
          workHoursByDay[date].hours += hoursWorked;
        } else {
          workHoursByDay[date] = {
            day,
            hours: hoursWorked,
            date,
          };
        }

        // Reset lastLoginTime after logout
        lastLoginTime = null;
      }
    });

    // Format the response
    const response = Object.keys(workHoursByDay).map((date) => ({
      day: workHoursByDay[date].day,
      hours: parseFloat(workHoursByDay[date].hours.toFixed(2)), // Rounded to 2 decimal places
      date, // Include the date in the response
    }));

    res.json(response);
  });
};

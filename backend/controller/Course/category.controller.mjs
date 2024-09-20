import db from "../../config/db.config.mjs";

export const getCategory = (req, res) => {
  const getCategory = "select * from course_category";

  db.query(getCategory, (err, result) => {
    if (err) {
      console.log("error", err);
      res.json({ message: "db_error" });
    } else {
      res.status(200).json({ result });
    }
  });
};

export const addCategory = (req, res) => {
  const { course_category_name } = req.body;

  if (!course_category_name) {
    return res.status(400).json({ message: "course_category_name is required" });
  }

  const addCategoryQuery = `INSERT INTO course_category (course_category_name) VALUES (?)`;

  db.query(addCategoryQuery, [course_category_name], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error occurred" });
    }

    // Assuming the course_category_id is auto-incremented, you can return the new ID and name
    const newCategoryId = result.insertId;
    return res.status(201).json({
      message: "Category added successfully",
      course_category_id: newCategoryId,
      course_category_name: course_category_name,
    });
  });
};

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
import express from "express";

const router = express.Router();

router.post('/profileChanges', async (req, res) => {
  const { firstName, lastName, middleName, location } = req.body;
  
  console.log(`В БД передано: 
              firstName: ${firstName}
              lastName: ${lastName}
              middleName: ${middleName}
              location: ${location}`);
  
  try {
    // const user = await UserModel.findOneAndUpdate(
    //   { _id: userId }, 
    //   { firstName, lastName, middleName, location },
    //   { new: true }
    // );
    
    // Після успішного збереження
    res.status(200).json({ 
      success: true,
      message: "Дані успішно оновлено"
    });
  } catch (error) {
    console.error('Помилка збереження:', error);
    res.status(500).json({ 
      success: false,
      message: "Помилка сервера при збереженні даних"
    });
  }
});

export default router;
// server/controllers/markerController.js
import Marker from '../model/marker.js';

// Создание нового маркера
export const createMarker = async (req, res) => {
  try {
    const marker = new Marker(req.body);
    await marker.save();
    res.status(201).json(marker);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Получение всех маркеров
export const getMarkers = async (req, res) => {
  try {
    const markers = await Marker.find();
    res.status(200).json(markers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Обновление маркера
export const updateMarker = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMarker = await Marker.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedMarker) {
      return res.status(404).json({ error: 'Маркер не найден' });
    }
    res.status(200).json(updatedMarker);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Удаление маркера (пустая болванка)
export const deleteMarker = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMarker = await Marker.findByIdAndDelete(id);
    if (!deletedMarker) {
      return res.status(404).json({ error: 'Маркер не найден' });
    }
    res.status(200).json({ message: 'Маркер удалён' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

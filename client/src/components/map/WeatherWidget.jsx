import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import { BsThermometerHalf, BsCloudRain } from 'react-icons/bs';
import { FaTimes } from 'react-icons/fa';
import { FaCloudSunRain, FaUmbrella, FaCloudRain } from 'react-icons/fa';
import { GiWhirlwind, GiHeavyRain, GiRaining } from 'react-icons/gi';
import { IoPartlySunny, IoCloudyNight } from 'react-icons/io5';
import { RiWindyLine } from 'react-icons/ri';
import { TiWeatherPartlySunny, TiWeatherStormy } from 'react-icons/ti';
import {
  WiDaySunny,
  WiDayCloudy,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiBarometer,
  WiDayCloudyGusts,
  WiCloudRefresh,
  WiStormWarning,
  WiDayRainMix,
  WiWindy,
  WiHumidity,
  WiThermometer,
} from 'react-icons/wi';

export default function WeatherWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center p-2 bg-white text-gray-700 rounded-full shadow-md
                 hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 border border-gray-200"
        title="Погода"
      >
        <FaCloudRain className="text-3xl" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-full shadow-lg p-4 w-[300px] z-50"
          >
            {/* ... содержимое виджета ... */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

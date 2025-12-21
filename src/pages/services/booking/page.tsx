import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../../components/feature/Navbar';
import Footer from '../../../components/feature/Footer';

interface Treatment {
  id: string;
  name: string;
  duration: string;
  price: string;
}

interface Employee {
  id: string;
  name: string;
  title: string;
  image: string;
  rating: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const mockTreatments: Treatment[] = [
  { id: '1', name: 'Signature Hydrafacial', duration: '60 min', price: '$180' },
  { id: '2', name: 'Chemical Peel', duration: '45 min', price: '$150' },
  { id: '3', name: 'Microneedling', duration: '90 min', price: '$350' },
  { id: '4', name: 'LED Light Therapy', duration: '30 min', price: '$80' },
];

const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    title: 'Lead Aesthetician',
    image: 'https://readdy.ai/api/search-image?query=professional%20female%20aesthetician%20in%20white%20coat%20smiling%20confident%20medical%20spa%20setting%20clean%20background%20portrait%20photography&width=200&height=200&seq=book-emp-1&orientation=squarish',
    rating: 4.9,
  },
  {
    id: '2',
    name: 'Emily Rodriguez',
    title: 'Senior Esthetician',
    image: 'https://readdy.ai/api/search-image?query=friendly%20female%20skincare%20specialist%20professional%20attire%20spa%20environment%20warm%20smile%20portrait%20clean%20aesthetic&width=200&height=200&seq=book-emp-2&orientation=squarish',
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Michael Park',
    title: 'Skincare Specialist',
    image: 'https://readdy.ai/api/search-image?query=professional%20male%20esthetician%20in%20spa%20uniform%20confident%20smile%20clinical%20setting%20portrait%20photography%20clean%20background&width=200&height=200&seq=book-emp-3&orientation=squarish',
    rating: 4.7,
  },
];

const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  
  hours.forEach(hour => {
    [0, 30].forEach(minute => {
      const time = `${hour > 12 ? hour - 12 : hour}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
      slots.push({
        time,
        available: Math.random() > 0.3, // Random availability
      });
    });
  });
  
  return slots;
};

export default function BookingPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [step, setStep] = useState(1);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots] = useState<TimeSlot[]>(generateTimeSlots());

  // Generate next 30 days
  const generateDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const [availableDates] = useState(generateDates());

  const handleNext = () => {
    if (step === 1 && selectedTreatment) setStep(2);
    else if (step === 2 && selectedEmployee) setStep(3);
    else if (step === 3 && selectedDate && selectedTime) {
      // Complete booking - navigate to success page
      navigate(`/services/booking-success?serviceId=${id}`);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const isNextDisabled = () => {
    if (step === 1) return !selectedTreatment;
    if (step === 2) return !selectedEmployee;
    if (step === 3) return !selectedDate || !selectedTime;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F6F3] to-white">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(`/services/${id}`)}
              className="flex items-center gap-2 text-[#2C5F4F] hover:text-[#234839] mb-4 cursor-pointer"
            >
              <i className="ri-arrow-left-line"></i>
              <span>Back to Business</span>
            </button>

            <h1 className="font-['Cormorant_Garamond'] text-5xl font-bold text-[#2C5F4F] mb-3">
              Book Your Appointment
            </h1>
            <p className="text-lg text-gray-600">
              Radiance Skin Studio
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {[
                { num: 1, label: 'Select Service' },
                { num: 2, label: 'Choose Provider' },
                { num: 3, label: 'Pick Date & Time' },
              ].map((item, idx) => (
                <div key={item.num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-all ${
                        step >= item.num
                          ? 'bg-[#2C5F4F] text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {step > item.num ? (
                        <i className="ri-check-line text-2xl"></i>
                      ) : (
                        item.num
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        step >= item.num ? 'text-[#2C5F4F]' : 'text-gray-400'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div
                      className={`h-1 flex-1 mx-4 rounded transition-all ${
                        step > item.num ? 'bg-[#2C5F4F]' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
            {/* Step 1: Select Service */}
            {step === 1 && (
              <div>
                <h2 className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#2C5F4F] mb-6">
                  Select Your Service
                </h2>
                <div className="space-y-4">
                  {mockTreatments.map((treatment) => (
                    <div
                      key={treatment.id}
                      onClick={() => setSelectedTreatment(treatment)}
                      className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedTreatment?.id === treatment.id
                          ? 'border-[#2C5F4F] bg-[#F8F6F3]'
                          : 'border-gray-200 hover:border-[#2C5F4F]/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#2C5F4F] mb-2">
                            {treatment.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <i className="ri-time-line text-[#2C5F4F]"></i>
                              <span>{treatment.duration}</span>
                            </div>
                            <span className="text-xl font-bold text-[#2C5F4F]">
                              {treatment.price}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedTreatment?.id === treatment.id
                              ? 'border-[#2C5F4F] bg-[#2C5F4F]'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedTreatment?.id === treatment.id && (
                            <i className="ri-check-line text-white text-sm"></i>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Choose Provider */}
            {step === 2 && (
              <div>
                <h2 className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#2C5F4F] mb-6">
                  Choose Your Provider
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {mockEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      onClick={() => setSelectedEmployee(employee)}
                      className={`p-6 border-2 rounded-xl cursor-pointer transition-all text-center ${
                        selectedEmployee?.id === employee.id
                          ? 'border-[#2C5F4F] bg-[#F8F6F3]'
                          : 'border-gray-200 hover:border-[#2C5F4F]/30'
                      }`}
                    >
                      <div className="relative inline-block mb-4">
                        <div className="w-24 h-24 rounded-full overflow-hidden mx-auto">
                          <img
                            src={employee.image}
                            alt={employee.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {selectedEmployee?.id === employee.id && (
                          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#2C5F4F] flex items-center justify-center">
                            <i className="ri-check-line text-white"></i>
                          </div>
                        )}
                      </div>
                      <h3 className="font-['Cormorant_Garamond'] text-xl font-bold text-[#2C5F4F] mb-1">
                        {employee.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{employee.title}</p>
                      <div className="flex items-center justify-center gap-1">
                        <i className="ri-star-fill text-[#E8956C]"></i>
                        <span className="font-medium text-[#2C5F4F]">{employee.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Pick Date & Time */}
            {step === 3 && (
              <div>
                <h2 className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#2C5F4F] mb-6">
                  Select Date &amp; Time
                </h2>
                
                {/* Date Selection */}
                <div className="mb-8">
                  <h3 className="font-medium text-[#2C5F4F] mb-4">Choose a Date</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {availableDates.slice(0, 14).map((date, idx) => {
                      const isSelected = selectedDate?.toDateString() === date.toDateString();
                      const isToday = date.toDateString() === new Date().toDateString();
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedDate(date)}
                          className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#2C5F4F] bg-[#2C5F4F] text-white'
                              : 'border-gray-200 hover:border-[#2C5F4F]/30'
                          }`}
                        >
                          <div className="text-xs mb-1">
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          <div className="text-lg font-bold">
                            {date.getDate()}
                          </div>
                          {isToday && !isSelected && (
                            <div className="text-xs text-[#2C5F4F] mt-1">Today</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <h3 className="font-medium text-[#2C5F4F] mb-4">Choose a Time</h3>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                      {timeSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer ${
                            selectedTime === slot.time
                              ? 'border-[#2C5F4F] bg-[#2C5F4F] text-white'
                              : slot.available
                              ? 'border-gray-200 hover:border-[#2C5F4F]/30'
                              : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Booking Summary */}
          {(selectedTreatment || selectedEmployee || (selectedDate && selectedTime)) && (
            <div className="bg-[#F8F6F3] rounded-2xl p-6 mb-8">
              <h3 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#2C5F4F] mb-4">
                Booking Summary
              </h3>
              <div className="space-y-3">
                {selectedTreatment && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium text-[#2C5F4F]">{selectedTreatment.name}</span>
                  </div>
                )}
                {selectedEmployee && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Provider:</span>
                    <span className="font-medium text-[#2C5F4F]">{selectedEmployee.name}</span>
                  </div>
                )}
                {selectedDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-[#2C5F4F]">
                      {selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium text-[#2C5F4F]">{selectedTime}</span>
                  </div>
                )}
                {selectedTreatment && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-300">
                    <span className="font-bold text-[#2C5F4F]">Total:</span>
                    <span className="font-bold text-[#2C5F4F] text-xl">{selectedTreatment.price}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 px-8 py-4 bg-white border-2 border-[#2C5F4F] text-[#2C5F4F] rounded-lg hover:bg-[#F8F6F3] transition-colors font-medium text-lg whitespace-nowrap cursor-pointer"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={isNextDisabled()}
              className="flex-1 px-8 py-4 bg-[#2C5F4F] text-white rounded-lg hover:bg-[#234839] transition-colors font-medium text-lg whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 3 ? 'Confirm Booking' : 'Next'}
              <i className="ri-arrow-right-line ml-2"></i>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

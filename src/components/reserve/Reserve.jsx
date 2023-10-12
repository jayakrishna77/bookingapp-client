import React, { useContext, useState } from 'react';

import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import useFetch from '../../hooks/useFetch';
import { SearchContext } from '../../context/SearchContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Reserve = ({ setOpenModel, hotelId }) => {
    const { data, loading, error } = useFetch(`hotels/room/${hotelId}`);
    const [selectedRooms, setSelectedRooms] = useState([]);
    const { dates } = useContext(SearchContext);
    const navigate = useNavigate();

    const getDatesInRange = (start, end) => {
        const date = new Date(start.getTime());

        let dates = []

        while (date <= end) {
            dates.push(new Date(date).getTime())
            date.setDate(date.getDate() + 1)
        }

        return dates;
    }

    const allDates = getDatesInRange(dates[0].startDate, dates[0].endDate);

    const isAvailable = (roomNumber) => {
        const isFound = roomNumber.unavailableDates.some((date) =>
            allDates.includes(new Date(data).getTime())
        );

        return !isFound
    }

    const handleSelect = (e) => {
        const selected = e.target.checked;
        const value = e.target.value;
        setSelectedRooms(selected ? [...selectedRooms, value] : selectedRooms.filter((item) => {
            return item !== value
        }))
    }

    const handleClick = async () => {
        try {
            await Promise.all(
                selectedRooms.map((roomId) => {
                    const res = axios.put(`/rooms/availability/${roomId}`, { dates: allDates });
                    return res.data;
                })
            )
            setOpenModel(false);
            navigate('/')
        } catch (err) {
            console.log(err)
        }
    }
    return (
        <div className="reserve">
            <div className="rContainer">
                <FontAwesomeIcon
                    icon={faCircleXmark}
                    className='rClose'
                    onClick={() => setOpenModel(false)}
                />
                <span>Select your rooms:</span>
                {data.map((item) => {
                    return (
                        <div className="rItem">
                            <div className="rItemInfo">
                                <div className="rTitle">{item.title}</div>
                                <div className="rDesc">{item.desc}</div>
                                <div className="rMax">Max people: <b>{item.maxPrice}</b></div>
                                <div className="rPrice">{item.price}</div>
                            </div>
                            <div className="rSelectRooms">
                                {item?.roomNumbers.map((roomNumber) => {
                                    return (
                                        <div className="room">
                                            <label>{roomNumber.number}</label>
                                            <input
                                                type='checkbox'
                                                value={roomNumber._id}
                                                onChange={handleSelect}
                                                disabled={!isAvailable(roomNumber)}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
                <button className="rButton" onClick={handleClick}>Reserve Now!</button>
            </div>
        </div>
    )
}

export default Reserve;
import React, { useEffect, useState, useRef, useMemo } from "react";
import NavBar from '../../components/NavBar'
import Calendar from "../../components/Calendar";
import { PieChart, LineChart, BarChart } from "@mui/x-charts";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faAngleRight, faFilter, faSquare, faXmark, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { formatDate, getCategoriesAndDefaults, getFilterData } from "../../firebaseService"; // Asegúrate que la ruta sea correcta
import Loading from "../../components/Loading";
import Data from "../Data";
import { EmptyChart } from "./components/EmptyChart";
import DrinksTable from "./components/DrinksTable";
import CategoryChart from "./components/CategoryChart";
import Goals from "./components/Goals";

const palette = [
    '#a1bc1f', '#FA9B6A', '#c3c3c3', '#a2e8d6', '#ffb5fa', '#efef70',
    '#F4D06F', '#ffaaaa', '#f78c8c', '#aaa3ff', '#F7B7A3', '#616161', '#D5C7BC'
];

export default function Dashboard() {
    // UI State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false); // Nuevo estado para errores
    const [openFilter, setOpenFilter] = useState(false);
    const [filters, setFilters] = useState(null);
    const [chartWidth, setChartWidth] = useState(300);
    
    // Data State (Datos crudos de la BD)
    const [categories, setCategories] = useState([]);
    const [userCalories, setUserCalories] = useState([]);
    const [drinksData, setDrinksData] = useState([]);
    const [goals, setGoals] = useState(null);
    
    const chartRef = useRef(null);
    const charts = [{ label: 'Weekly' }, { label: 'Monthly' }, { label: 'Annual' }];
    const icons = Data.iconOptions;
    
    const lineLeyend = [
        { label: 'Fats', color: palette[0] }, 
        { label: 'Carbohydrates', color: palette[1] }, 
        { label: 'Protein', color: palette[2] }, 
        { label: 'Sodium', color: palette[3] }, 
        { label: 'Filter', color: palette[4] }, 
        { label: 'Calories', color: palette[5] }
    ];

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);
            setError(false);
            try {
                const [catsData, filterData] = await Promise.all([
                    getCategoriesAndDefaults(),
                    getFilterData()
                ]);

                if (isMounted) {
                    setCategories(catsData);
                    if (filterData) {
                        setGoals(filterData.goals);
                        setUserCalories(filterData.calories || []);
                        setDrinksData(filterData.drinks || []);
                    }
                    setLoading(false);
                }
            } catch (e) {
                console.error("Error fetching dashboard data: ", e);
                if (isMounted) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => { isMounted = false; };
    }, []); 

    useEffect(() => {
        const handleResize = () => { chartRef.current && setChartWidth(chartRef.current.offsetWidth) };
        window.addEventListener('resize', handleResize);
        handleResize(); // Check inicial
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const drinksDay = useMemo(() => {
        if (!drinksData) return [];
        return drinksData.filter((item) =>
            new Date(item.date_ingested).getDate() === currentDate.getDate() &&
            new Date(item.date_ingested).getMonth() === currentDate.getMonth() &&
            new Date(item.date_ingested).getFullYear() === currentDate.getFullYear()
        );
    }, [drinksData, currentDate]);

    const weeklyCal = useMemo(() => {
        const getWeeklyDates = (selectedDate) => {
            let dayOfStart = new Date(selectedDate);
            const dayOfWeek = dayOfStart.getDay();
            const diff = dayOfStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            dayOfStart.setDate(diff);
            const week = [];
            for (let i = 0; i < 7; i++) {
                const day = new Date(dayOfStart);
                day.setDate(dayOfStart.getDate() + i);
                week.push(formatDate(day));
            }
            return week;
        };

        const weeklyDates = getWeeklyDates(currentDate);
        const graphic = { dates: [], calories: [], sodium: [], carbohydrates: [], fats: [], protein: [], categories: [] };

        if (userCalories) {
            userCalories.forEach(item => {
                if (weeklyDates.includes(item.day)) {
                    graphic.dates.push(item.day);
                    graphic.calories.push(Number(item.calories));
                    graphic.sodium.push(Number(item.sodium));
                    graphic.fats.push(Number(item.fats));
                    graphic.carbohydrates.push(Number(item.carbohydrates));
                    graphic.protein.push(Number(item.protein));
                    graphic.categories.push(item.categories || []);
                }
            });
        }
        return graphic;
    }, [userCalories, currentDate]);

    // Lógica Mensual
    const monthlyCal = useMemo(() => {
        const graphic = { dates: [], calories: [], sodium: [], carbohydrates: [], fats: [], protein: [], categories: [] };
        if (!userCalories || userCalories.length === 0) return graphic;

        const monthlyItems = userCalories.filter(item => {
            const [day, month, year] = item.day.split('/').map(Number);
            const itemDate = new Date(year, month - 1, day);
            return (itemDate.getMonth() === currentDate.getMonth() && itemDate.getFullYear() === currentDate.getFullYear());
        });

        monthlyItems.forEach(item => {
            graphic.dates.push(item.day);
            graphic.calories.push(item.calories);
            graphic.fats.push(item.fats);
            graphic.carbohydrates.push(item.carbohydrates);
            graphic.sodium.push(item.sodium);
            graphic.protein.push(item.protein);
            graphic.categories.push(item.categories || []);
        });

        return graphic;
    }, [userCalories, currentDate]);

    // Lógica Anual
    const annualCal = useMemo(() => {
        const graphic = { dates: [], calories: [], sodium: [], carbohydrates: [], fats: [], protein: [], categories: [] };
        if (!userCalories || userCalories.length === 0) return graphic;

        const months = Array.from({ length: 12 }, () => ({ calories: 0, fats: 0, carbohydrates: 0, sodium: 0, protein: 0, categories: {} }));
        
        userCalories.forEach(item => {
            const [day, month, year] = item.day.split('/').map(Number);
            // Validamos que sea el año actual seleccionado
            if (year === currentDate.getFullYear()) {
                const idx = month - 1;
                months[idx].calories += Number(item.calories);
                months[idx].fats += Number(item.fats);
                months[idx].sodium += Number(item.sodium);
                months[idx].carbohydrates += Number(item.carbohydrates);
                months[idx].protein += Number(item.protein);
                item.categories.forEach(category => {
                    if (!months[idx].categories[category.label]) {
                        months[idx].categories[category.label] = 0;
                    }
                    months[idx].categories[category.label] += Number(category.value);
                });
            }
        });

        const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        monthLabels.forEach((month, idx) => {
            graphic.dates.push(month);
            graphic.calories.push(months[idx].calories);
            graphic.protein.push(months[idx].protein);
            graphic.carbohydrates.push(months[idx].carbohydrates);
            graphic.sodium.push(months[idx].sodium);
            graphic.fats.push(months[idx].fats);
            
            const categoriesArray = categories.map(item => ({
                label: item.name,
                value: months[idx].categories[item.name] || 0
            }));
            graphic.categories.push(categoriesArray);
        });

        return graphic;
    }, [userCalories, currentDate, categories]);

    // Datos del gráfico de bebidas
    const drinksChartData = useMemo(() => {
        if (!drinksDay || drinksDay.length === 0) return { types: [], sugarData: [], caffeineData: [], caloriesData: [] };
        const drinkTypes = {};
        
        drinksDay.forEach(drink => {
            const type = drink.type;
            if (!drinkTypes[type]) {
                drinkTypes[type] = { sugar: 0, caffeine: 0, calories: 0 };
            }
            drinkTypes[type].sugar += drink.sugar;
            drinkTypes[type].caffeine += drink.caffeine;
            drinkTypes[type].calories += drink.calories;
        });
        
        const types = Object.keys(drinkTypes);
        return {
            types: types,
            sugarData: types.map(type => drinkTypes[type].sugar),
            caffeineData: types.map(type => drinkTypes[type].caffeine),
            caloriesData: types.map(type => drinkTypes[type].calories)
        };
    }, [drinksDay]);



    const nextChart = () => {
        setIndex(prev => prev === (charts.length - 1) ? 0 : prev + 1);
    };

    const previusChart = () => {
        setIndex(prev => prev === 0 ? (charts.length - 1) : prev - 1);
    };


    const handleRetry = () => window.location.reload();


    
    if (error) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center font-quicksand">
                <p className="text-xl text-healthyDarkGray1 mb-4">Ups! Something went wrong loading your data.</p>
                <button onClick={handleRetry} className="bg-healthyOrange text-white px-4 py-2 rounded-full hover:bg-healthyDarkOrange transition">
                    <FontAwesomeIcon icon={faRotateRight} className="mr-2" />
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className='w-full xs:flex xs:flex-col xs:justify-around lg:items-center sm:h-full lg:h-screen overflow-y-hidden'>
            <NavBar className='z-50' />
            {loading ? <Loading /> :
                <div className='flex flex-col lg:flex-row justify-start lg:justify-center md:items-start lg:mt-24 items-start md:pt-24 lg:pt-8 w-full px-2 xs:px-6 overflow-y-scroll'>
                    

                    <div className="w-full lg:w-2/5 mt-4 xs:mt-8 md:mt-0 flex flex-col items-center font-quicksand justify-center">
                        <div className="flex justify-center items-center w-full">
                            <Calendar value={currentDate} onChange={e => setCurrentDate(new Date(e))} />
                        </div>
                        {userCalories && userCalories.find(item => item.day === formatDate(currentDate)) ?
                            <div className="xs:mt-6 mt-0 flex flex-col w-full items-center justify-start">
                                <CategoryChart userCalories={userCalories} currentDate={formatDate(currentDate)} palette={palette} chartWidth={chartWidth} />
                            </div>
                            :
                            <p className="font-quicksand text-sm font-semibold text-healthyGray1 text-center mt-4 md:w-3/5 md:my-10 lg:mt-4" >There are no meals recorded for {formatDate(currentDate)}</p>
                        }
                        {userCalories && goals && <Goals userCalories={userCalories} currentDate={formatDate(currentDate)} goals={goals} />}
                        {(drinksDay && drinksDay.length > 0 && userCalories.find(item => item.day === formatDate(currentDate))) ? 
                            <DrinksTable drinksDay={drinksDay} /> :
                            <p className="font-quicksand text-sm font-semibold text-healthyGray1 text-center mt-4 md:w-full md:my-10 lg:mt-12">There are no drinks recorded for {formatDate(currentDate)}</p>
                        }
                    </div>


                    <div className="flex flex-col overflow-y-auto lg:w-3/5 w-full md:mt-4 lg:mt-0 pb-32 xs:pb-0 lg:ml-2 lg:overflow-x-hidden justify-center" ref={chartRef}>
                        <div className="flex flex-col xs:flex-row lg:ml-8 items-center lg:items-start justify-center lg:justify-start">
                            <div className="flex flex-col w-11/12 lg:mt-0 md:w-10/12 font-quicksand">
                                <div className="flex flex-row justify-between w-full p-3 rounded-xl bg-hbGreen items-center">
                                    <FontAwesomeIcon onClick={() => previusChart()} icon={faAngleLeft} className="text-darkGray hover:cursor-pointer text-xl px-2 hover:text-healthyDarkGray1" />
                                    <h1 className="text-darkGray font-belleza text-xl">{charts[index].label} charts</h1>
                                    <FontAwesomeIcon onClick={() => nextChart()} icon={faAngleRight} className="text-darkGray hover:cursor-pointer text-xl px-2 hover:text-healthyDarkGray1" />
                                </div>
                                <div className="flex flex-col w-full rounded-xl pt-2">
                                    <div className="w-full p-2 bg-healthyGreen rounded-t-xl">
                                        <p className="font-belleza text-lg text-darkGray pl-3">Category chart</p>
                                    </div>
                                    <div className="bg-hbGreen p-2 rounded-b-xl w-full flex">
                                        {(index === 0 && weeklyCal.calories.length === 0) || (index === 1 && monthlyCal.calories.length === 0) || (index === 2 && annualCal.calories.length === 0) ?
                                            <EmptyChart />
                                            :
                                            <div className="w-full flex flex-col justify-center items-center">
                                                <div className="flex justify-center items-center w-full flex-wrap">
                                                    {lineLeyend.map((item, i) =>
                                                        <div key={i} className="flex items-center justify-start font-quicksand py-1 px-2">
                                                            <FontAwesomeIcon icon={faSquare} style={{ color: item.color }} className={` mr-1`} />
                                                            <p className="text-xs text-darkGray ">{item.label}</p>
                                                        </div>)}
                                                </div>
                                                <div className="flex w-full justify-center items-center">
                                                    <LineChart
                                                        colors={palette}
                                                        xAxis={[{ scaleType: 'point', dataKey: 'date', data: index === 0 ? weeklyCal.dates : index === 1 ? monthlyCal.dates : annualCal.dates, labelStyle: { fontFamily: 'Quicksand' } }]}
                                                        series={[
                                                            { data: index === 0 ? weeklyCal.fats : index === 1 ? monthlyCal.fats : annualCal.fats },
                                                            { data: index === 0 ? weeklyCal.carbohydrates : index === 1 ? monthlyCal.carbohydrates : annualCal.carbohydrates },
                                                            { data: index === 0 ? weeklyCal.protein : index === 1 ? monthlyCal.protein : annualCal.protein },
                                                            { data: index === 0 ? weeklyCal.sodium : index === 1 ? monthlyCal.sodium : annualCal.sodium },
                                                            {
                                                                data: index === 0 ? (!filters ? weeklyCal.calories : weeklyCal.categories.map((item) => item.find((i) => i.label === filters.name)?.value || 0)) : 
                                                                      index === 1 ? (!filters ? monthlyCal.calories : monthlyCal.categories.map((item) => item.find((i) => i.label === filters.name)?.value || 0)) : 
                                                                      (!filters ? annualCal.calories : annualCal.categories.map((item) => item.find((i) => i.label === filters.name)?.value || 0)),
                                                            },
                                                            { data: index === 0 ? weeklyCal.calories : index === 1 ? monthlyCal.calories : annualCal.calories }
                                                        ]}
                                                        height={300}
                                                    />
                                                </div>
                                            </div>}
                                    </div>
                                </div>
                            </div>
                            

                            <div className="flex flex-row xs:flex-col justify-center m-1 items-center w-10/12 xs:w-1/12">
                                <FontAwesomeIcon onClick={() => setOpenFilter(!openFilter)} icon={faFilter} className={`hover:bg-healthyDarkOrange cursor-pointer text-white text-xl p-3 shadow-sm ${openFilter ? 'bg-healthyDarkOrange rounded-tl-full rounded-bl-full xs:rounded-bl-none xs:rounded-tr-full' : 'bg-healthyOrange rounded-full'} `} />
                                {openFilter &&
                                    <div className="flex flex-row xs:flex-col w-full max-w-44 overflow-x-auto justify-start xs:justify-center items-center shadow-sm rounded-r-full xs:rounded-b-full">
                                        {categories.map((cat, idx) => {
                                            const iconObj = icons.find((i) => i.name === cat.icon);
                                            return iconObj ? (
                                                <FontAwesomeIcon key={idx} onClick={() => setFilters(cat)} icon={iconObj.icon} className="px-2 xs:px-0 w-full py-2 text-xl text-healthyDarkOrange bg-white hover:bg-healthyGray2 cursor-pointer text-center" />
                                            ) : null;
                                        })}
                                    </div>
                                }
                                {filters &&
                                    <div className="flex relative">
                                        <FontAwesomeIcon icon={(icons.find((i) => i.name === filters.icon)).icon} className="text-white text-xl p-3 shadow-sm m-2 bg-healthyGray1 rounded-full" />
                                        <FontAwesomeIcon onClick={() => setFilters(null)} icon={faXmark} className="absolute right-0 bottom-0 p-1 text-sm border-2 border-white text-white bg-healthyGray1 hover:bg-healthyDarkGray1 cursor-pointer rounded-full" />
                                    </div>
                                }
                            </div>
                        </div>


                        <div className="w-full flex justify-center md:justify-start items-center md:ml-8 mt-12 mb-12">
                            <div className="flex flex-col rounded-xl pt-2 w-full md:w-10/12">
                                <div className="w-full p-2 bg-healthyGreen rounded-t-xl">
                                    <p className="font-belleza text-lg text-darkGray pl-3">Drink chart</p>
                                </div>
                                <div className="bg-hbGreen p-2 rounded-b-xl flex flex-col justify-center items-center" >
                                    <div className="flex justify-center items-center w-full flex-wrap">
                                        <div className="flex items-center justify-start font-quicksand py-1 px-2">
                                            <FontAwesomeIcon icon={faSquare} style={{ color: '#FA9B6A' }} className={`mr-1`} />
                                            <p className="text-xs text-darkGray">Sugar</p>
                                        </div>
                                        <div className="flex items-center justify-start font-quicksand py-1 px-2">
                                            <FontAwesomeIcon icon={faSquare} style={{ color: '#a1bc1f' }} className={`mr-1`} />
                                            <p className="text-xs text-darkGray">Caffeine</p>
                                        </div>
                                        <div className="flex items-center justify-start font-quicksand py-1 px-2">
                                            <FontAwesomeIcon icon={faSquare} style={{ color: '#c3c3c3' }} className={`mr-1`} />
                                            <p className="text-xs text-darkGray">Calories</p>
                                        </div>
                                    </div>
                                    {drinksDay && drinksDay.length > 0 && goals ? <BarChart
                                        xAxis={[{ scaleType: 'band', data: drinksChartData.types }]}
                                        series={[
                                            {
                                                data: Array(drinksChartData.types.length).fill(goals.sugar),
                                                stack: 'Sugar',
                                                color: '#C25C28',
                                            },
                                            {
                                                data: Array(drinksChartData.types.length).fill(goals.caffeine),
                                                stack: 'Caffeine',
                                                color: '#8ba020',
                                            },
                                            {
                                                data: Array(drinksChartData.types.length).fill(goals.calories),
                                                color: '#8e8b8b',
                                                stack: 'Calories',
                                            },

                                            {
                                                data: drinksChartData.sugarData,
                                                stack: 'Sugar',
                                                color: '#FA9B6A',
                                            },
                                            {
                                                data: drinksChartData.caffeineData,
                                                stack: 'Caffeine',
                                                color: '#a1bc1f',
                                            },
                                            {
                                                data: drinksChartData.caloriesData,
                                                stack: 'Calories',
                                                color: '#c3c3c3',
                                            }
                                        ]}
                                        colors={palette}
                                        height={window.innerWidth > 400 ? 400 : 300}
                                        width={window.innerWidth > 400 ? 700 : 300}
                                    /> :
                                        <EmptyChart />
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}
        </div>
    )
}
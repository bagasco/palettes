import axios from "axios";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDispatch, useSelector } from "react-redux";
import { DashboardLoading, DashboardLoadingSearch, DashboardSearch, DashboardTemplate, PaletteColorSaves } from "../../../components";
import { colorsGroup, getColorGroup, GetToken, stylesPalette } from "../../../lib";
import { fetchMoreColorsDashboard, selectDashboardColors, selectDashboardColorsPage, selectLoadingFetchMoreDashboardColors, setDashboardColors } from "../../../slices/dashboardSlice";
import { wrapper } from '../../../store';

export default function ColorsDashboard(){
    const colors = useSelector(selectDashboardColors);
    const colorsPage = useSelector(selectDashboardColorsPage);
    const dispatch = useDispatch();
    const loadingFetch = useSelector(selectLoadingFetchMoreDashboardColors);
    const [loadingFetchSearch,setLoadingFetchSearch] = useState(false);
    const [query,setQuery] = useState([]);
    const fetchColors = () => {
        dispatch(fetchMoreColorsDashboard(getQuery(query,parseInt(colorsPage)+1)));
    }
    const getQuery = (query,page) => {
        const style = stylesPalette.filter(data=>query.filter(data=>data.type==='style').map(q=>q.data.value).includes(data.value));
        const color = query.filter(data=>data.type==='color');
        const search = query.find(query=>query.type==='search');
        const queryList = [`page=${page}`];
        if (style.length>0) {
            queryList.push(`style=${style.map(data=>data.value).join(',')}`);
        }
        if (color.length>0) {
            queryList.push(`color=${color.map(data=>data.data.value).join(',')}`);
        }
        if (search) {
            queryList.push(`search=${search.value}`);
        }
        return queryList.join('&');
    }
    const handleAddQuery = (q) => {
        const filteredSearch = query.filter(data=>data.type!=='search');
        if (q.type==='color') {
            setQuery(filteredSearch.filter(data=>data.type!=='color'));
            setQuery(query=>filteredSearch.map(data=>data.data.value).includes(q.data.value) ? [...query.filter(q=>q.type==='search'),...filteredSearch.filter(data=>data.data.value!==q.data.value)] : [...query,q]);
        }else {
            setQuery(query=>filteredSearch.map(data=>data.data.value).includes(q.data.value) ? [...query.filter(q=>q.type==='search'),...filteredSearch.filter(data=>data.data.value!==q.data.value)] : [...query,q]);
        }
    }
    const fetchColorsSearch = async (query) => {
        setLoadingFetchSearch(true);
        const Colors = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/saves-colors/feed?${getQuery(query,1)
        }`,{
            headers: {
                Authorization: `bearer ${GetToken()}`
            }
        })
        setLoadingFetchSearch(false);
        dispatch(setDashboardColors(Colors.data));
    }
    const handleSearch = (e) => {
        e.preventDefault();
        if (e.target[0].value) {
            setQuery(query=>query.filter(data=>data.type!=='search'));
            setQuery(query=>[...query,{ type: 'search', value: e.target[0].value }]);
            fetchColorsSearch(query);
        }
    }
    const handleChangeSearch = (e) => {
        setQuery(query=>query.filter(data=>data.type!=='search'));
        if (e.target.value) {
            setQuery(query=>[...query,{ type: 'search', value: e.target.value }]);
        }else {
            fetchColorsSearch(query.filter(data=>data.type!=='search'));
        }
    }
    const handleRemoveSearch = () => {
        const newQuery = query.filter(data=>data.type!=='search');
        setQuery(newQuery);
        fetchColorsSearch(newQuery);
    }
    const filtersMenu = () => (
        <section id="menuContainer" className="p-4">
            <div className="mb-5">
                <h1 className="text-sm font-semibold mb-3.5">Style</h1>
                <div className="flex flex-wrap gap-2">
                    {stylesPalette.filter(data=>!data.value.includes('Colors') && data.value!=='Gradient').map((data,i)=>(
                        <div key={i} onClick={()=>handleAddQuery({ data, type: 'style' })} className={`h-8 px-3 rounded-lg border text-sm font-medium flex items-center transition cursor-pointer ${query.filter(q=>q.type==='style').map(q=>q.data.value).includes(data.value) ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'}`}>{data.value}</div>
                    ))}
                </div>
            </div>
            <div>
                <h1 className="text-sm font-semibold mb-3.5">Color</h1>
                <div className="flex flex-wrap gap-2">
                    {colorsGroup.map((data,i)=>(
                        <div key={i} onClick={()=>handleAddQuery({ data, type: 'color' })} className={`h-8 px-3 rounded-lg border text-sm font-medium flex items-center transition cursor-pointer gap-2 ${query.filter(q=>q.type==='color').map(q=>q.data.value).includes(data.value) ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'}`}>
                            <div style={{ backgroundColor: data.hex }} className={`w-3 h-3 rounded-full ${data.value==='White' && 'border'}`}></div>
                            <span>{data.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
    return (
        <DashboardTemplate>
            <DashboardSearch title={'Colors'} fetchData={fetchColorsSearch} handleRemoveSearch={handleRemoveSearch} handleChangeSearch={handleChangeSearch} query={query} filtersMenu={filtersMenu} handleSearch={handleSearch}/>
            {colors.data.length > 0 || loadingFetchSearch ? (
                loadingFetchSearch ? (
                <div className="grid gap-x-9 mt-10 gap-y-5 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(id=>(
                      <DashboardLoadingSearch key={id}/>  
                    ))}
                </div>
                ) : (
                <InfiniteScroll
                    dataLength={colors.data.length}
                    hasMore={true}
                    next={fetchColors}
                >
                    <div className="grid gap-x-9 mt-10 gap-y-5 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
                        {colors.data.map((data)=>(
                            <PaletteColorSaves data={data} key={data.id}/>
                        ))}
                    </div>
                </InfiniteScroll>
                )
            ) : (
            query.length > 0 ? (
            <div className="h-[calc(100vh-60px-60px-36px)] md:h-[calc(100vh-60px-80px-36px)] flex flex-col gap-4 items-center justify-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-14 h-14">
                    <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
                </svg>
                <p className="text-[15px]">No colors found</p>
                <button onClick={()=>{setQuery([]);fetchColorsSearch([])}} className="text-blue-500 hover:underline text-[15px]">Clear filters</button>
            </div>
            ) : (
            <div className="h-[calc(100vh-60px-60px-36px)] md:h-[calc(100vh-60px-80px-36px)] flex flex-col gap-4 items-center justify-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg"  fill="currentColor" className="w-24 h-24" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M7.21.8C7.69.295 8 0 8 0c.109.363.234.708.371 1.038.812 1.946 2.073 3.35 3.197 4.6C12.878 7.096 14 8.345 14 10a6 6 0 0 1-12 0C2 6.668 5.58 2.517 7.21.8zm.413 1.021A31.25 31.25 0 0 0 5.794 3.99c-.726.95-1.436 2.008-1.96 3.07C3.304 8.133 3 9.138 3 10a5 5 0 0 0 10 0c0-1.201-.796-2.157-2.181-3.7l-.03-.032C9.75 5.11 8.5 3.72 7.623 1.82z"/>
                    <path fillRule="evenodd" d="M4.553 7.776c.82-1.641 1.717-2.753 2.093-3.13l.708.708c-.29.29-1.128 1.311-1.907 2.87l-.894-.448z"/>
                </svg>
                <p className="text-[15px]">You {"don't"} have any color yet.</p>
            </div>
            )
            )}
            {loadingFetch && (
            <DashboardLoading/>
            )}
        </DashboardTemplate>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(store => async (ctx) => {
    try {
        const dataColors = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/saves-colors/feed?page=1`,{
            headers: {
                Authorization: `bearer ${GetToken(ctx)}`
            }
        })
        store.dispatch(setDashboardColors(dataColors.data));
    } catch (error) {
        return { notFound: true }
    }
})
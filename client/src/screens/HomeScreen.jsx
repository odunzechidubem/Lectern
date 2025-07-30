import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import { useGetCoursesQuery } from '../slices/coursesApiSlice';
import { useGetArticlesQuery } from '../slices/articlesApiSlice';
import CourseCard from '../components/CourseCard';
import PdfViewer from '../components/PdfViewer';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { FaSearch } from 'react-icons/fa';
import useDebounce from '../hooks/useDebounce';

const HomeScreen = () => {
  const coursesSectionRef = useRef(null);
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { data: courses, isLoading: isLoadingCourses, error: coursesError } = useGetCoursesQuery(debouncedSearchTerm);
  const { data: articles, isLoading: isLoadingArticles, error: articlesError } = useGetArticlesQuery();

  useEffect(() => { if (location.state?.scrollToCourses) { coursesSectionRef.current?.scrollIntoView({ behavior: 'smooth' }); } }, [location.state]);

  return (
    <div className="w-full flex flex-col">
      <Hero />
      <div ref={coursesSectionRef} className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Available Courses</h1>
          <div className="relative w-full md:w-1/3"><input type="text" name="search" onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} placeholder="Search for courses..." className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10" /><FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /></div>
        </div>
        {isLoadingCourses ? <Loader /> : coursesError ? <Message variant='error'>{coursesError?.data?.message || coursesError.error}</Message> : (
          <>
            {courses && courses.length === 0 ? <Message>No courses found.</Message> : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{courses?.map((course) => (<CourseCard key={course._id} course={course} />))}</div>)}
          </>
        )}
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Featured Articles</h1>
        {isLoadingArticles ? <Loader /> : articlesError ? <Message variant='error'>{articlesError?.data?.message || articlesError.error}</Message> : (
          <>
            {articles && articles.length === 0 ? <Message>No articles have been posted yet.</Message> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {articles?.map(article => {
                  // --- THIS IS THE DIAGNOSTIC LOG ---
                  console.log('Rendering article with this data:', article);
                  
                  return (
                    <div key={article._id} className="flex flex-col">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">{article.title}</h2>
                      <p className="text-gray-600 mb-4">{article.description}</p>
                      <div className="flex-grow">
                        <PdfViewer fileUrl={article.fileUrl} publicPages={article.publicPages} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default HomeScreen;
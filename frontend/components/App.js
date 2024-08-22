import React, { useState, useEffect } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState()
  const [spinnerOn, setSpinnerOn] = useState(false)

  // ✨ Research `useNavigate` in React Router v.6
  const navigate = useNavigate()
  const redirectToLogin = () => { navigate('/');/* ✨ implement */ }
  const redirectToArticles = () => { navigate('/articles');/* ✨ implement */ }



   // ✨ implement
    // If a token is in local storage it should be removed,
    // and a message saying "Goodbye!" should be set in its proper state.
    // In any case, we should redirect the browser back to the login screen,
    // using the helper above.
  const logout = () => {
  // Remove the token from local storage
  localStorage.removeItem('token');

  // Set the message to "Goodbye!"
  setMessage('Goodbye!');

  // Redirect to the login screen
  redirectToLogin();
  }



  // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch a request to the proper endpoint.
    // On success, we should set the token to local storage in a 'token' key,
    // put the server success message in its proper state, and redirect
    // to the Articles screen. Don't forget to turn off the spinner!
  const login = ({ username, password }) => {
    // Flush the message state
  setMessage('');

  // Turn on the spinner
  setSpinnerOn(true);

  // Launch a request to the proper endpoint
  fetch(loginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  .then(response => {
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  })
  .then(data => {
    const { token, message } = data;
    localStorage.setItem('token', token);
    setMessage(message);
    redirectToArticles();
  })
  .catch(error => {
    console.error('Login failed:', error);
    setMessage('Login failed. Please try again.');
  })
  .finally(() => setSpinnerOn(false));
};



  // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch an authenticated request to the proper endpoint.
    // On success, we should set the articles in their proper state and
    // put the server success message in its proper state.
    // If something goes wrong, check the status of the response:
    // if it's a 401 the token might have gone bad, and we should redirect to login.
    // Don't forget to turn off the spinner!
  const getArticles = async () => {
    setMessage("")
    setSpinnerOn(true)
    const token = localStorage.getItem("token")

    fetch(articlesUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
    .then(response => {
      if (!response.ok) {
        if (response.status === 401) {
          // Token has expired or is invalid
          redirectToLogin();
        }
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const { articles, message } = data;
      setArticles(articles);
      setMessage(message);
    })
    .catch(error => {
      console.error('Failed to get articles:', error);
      setMessage('Failed to get articles. Please try again.');
    })
    .finally(() => setSpinnerOn(false));
  };



  // ✨ implement
    // The flow is very similar to the `getArticles` function.
    // You'll know what to do! Use log statements or breakpoints
    // to inspect the response from the server.
  const postArticle = async article => {
    setMessage("")
    setSpinnerOn(true)

    const token = localStorage.getItem("token")

    fetch(articlesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(article),
    })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        const { message } = data;
        setMessage(message);
        setArticles([...articles, data.article]);
      })
      .catch(error => {
        console.error('Failed to post article:', error);
        if (error.message.includes('401')) redirectToLogin();
        else setMessage('Failed to post article. Please try again.');
      })
      .finally(() => setSpinnerOn(false));
  }


   // ✨ implement
    // You got this!
  const updateArticle = async ({ article_id, article }) => {
   setMessage()
   setSpinnerOn(true)
   const token = localStorage.getItem('token');

   fetch(`${articlesUrl}/${article_id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(article),
  })
    .then(response => {
      if (!response.ok) {
        if (response.status === 401) redirectToLogin();
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(response => {
      if (!response.ok) {
        if (response.status === 401) {
          redirectToLogin();
        }
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const { message, article: updatedArticle } = data;
      setMessage(message);
      setArticles(prevArticles =>
        prevArticles.map(a => a.id === article_id ? updatedArticle : a)
      );
    })
    .catch(error => {
      console.error('Failed to update article:', error);
      if (error.message.includes('401')) {
        redirectToLogin();
      } else {
        setMessage('Failed to update article. Please try again.');
      }
    })
    .finally(() => setSpinnerOn(false));

  }

  const deleteArticle = async article_id => {
    // ✨ implement
    setMessage('');
    setSpinnerOn(true);

    const token = localStorage.getItem('token');

    fetch(`${articlesUrl}/${article_id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(response => {
        if (response.ok) {
          setMessage('Article deleted successfully');
          setArticles(prevArticles =>
            prevArticles.filter(art => art.id !== article_id)
          );
        } else if (response.status === 401) {
          redirectToLogin();
        } else {
          return response.json().then(data => {
            setMessage(data.message || 'Failed to delete article');
          });
        }
      })
      .catch(() => setMessage('An error occurred'))
      .finally(() => setSpinnerOn(false));
  }

  return (
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
    <>
     <Spinner on={spinnerOn} />
     <Message message={message} />
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}> {/* <-- do not change this line */}
        <h1>My Whatever this is.</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} />} />
          <Route path="articles" element={
            <>
             <ArticleForm
                postArticle={postArticle}
                updateArticle={updateArticle}
                setCurrentArticleId={setCurrentArticleId}
                currentArticle={articles.find(article => article.article_id === currentArticleId)}
              />
              <Articles
                articles={articles}
                getArticles={getArticles}
                deleteArticle={deleteArticle}
                setCurrentArticleId={setCurrentArticleId}
              />
            </>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2024</footer>
      </div>
    </>
  )
}


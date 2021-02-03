import { navigateTo } from '../index.js';
import { auth, db } from '../firebaseConfig.js';

const dashboardScript = () => {
  const select = document.querySelector('.selectCategory');
  const newCatBtn = document.querySelector('.btnAddCategory');
  const newCatInput = document.querySelector('.inputNewCat');
  const collectionForm = document.querySelector('.collectionForm');
  const titleInput = document.querySelector('.inputTitle');
  const authorInput = document.querySelector('.inputAuthor');
  const selectPriority = document.querySelector('.selectPriority');
  const selectSort = document.querySelector('.selectSort');
  const inputSearch = document.querySelector('.inputSearch');

  let renderData = null;
  let sortType = 'title';

  auth.onAuthStateChanged((user) => {
    if (user) {
      let catData;
      const renderSelect = () => {
        db.collection('users')
          .doc(user.uid)
          .get()
          .then((snapshot) => {
            catData = snapshot.data().BooksCategory;
            for (let key in catData) {
              const selectOption = document.createElement('option');
              selectOption.text = catData[key];
              selectOption.value = catData[key];
              if (select) {
                select.appendChild(selectOption);
              }
            }
          });
      };
      renderSelect();

      newCatBtn.addEventListener('click', async () => {
        if (newCatInput.value) {
          for (let key in catData) {
            if (catData[key] === newCatInput.value) {
              alert('Category exists');
              return;
            }
          }
          const newKey = Object.keys(catData).length;
          const newEl = {
            [newKey]: newCatInput.value,
          };
          catData = {
            ...catData,
            ...newEl,
          };
          await db.collection('users').doc(user.uid).update({
            BooksCategory: catData,
          });
          if (select) {
            select.innerHTML = '';
          }
          newCatInput.value = '';
          renderSelect();
        } else {
          alert('Add category input is empty');
        }
      });
    } else {
      console.log('user is not signed in');
      navigateTo('/signin');
    }

    const addBookToDataBase = async (book) => {
      let booksData;
      await db
        .collection('users')
        .doc(user.uid)
        .get()
        .then((snapshot) => {
          booksData = snapshot.data().BooksCollection;
        });
      booksData = [...booksData, book];
      await db.collection('users').doc(user.uid).update({
        BooksCollection: booksData,
      });
    };

    const renderColection = (books) => {
      const booksContainer = document.querySelector('.booksCollectionContainer');
      sortType == sortType.toLowerCase();
      if (books.length) {
        books.sort((a, b) => {
          if (sortType == 'priority') {
            return a[sortType] < b[sortType] ? 1 : -1;
          } else {
            return a[sortType].localeCompare(b[sortType]);
          }
        });
      }

      const filterBooks = (books) => {
        console.log(books);
      };

      //Here must be called function filter filterBooks(books)
      filterBooks(books);

      booksContainer.innerHTML = '';

      if (books) {
        books.map((el) => {
          const containerBook = document.createElement('div');
          containerBook.classList.add('containerBook');
          booksContainer.appendChild(containerBook);
          const bookData = document.createElement('div');
          bookData.classList.add('bookData');
          containerBook.appendChild(bookData);

          const spanTitle = document.createElement('span');
          spanTitle.classList.add('titleSpan');
          spanTitle.innerText = 'Title: ' + el.title;
          const spanAuthor = document.createElement('span');
          spanAuthor.classList.add('authorSpan');
          spanAuthor.innerText = el.author ? 'Author: ' + el.author : 'Author: no data';
          const spanCategory = document.createElement('span');
          spanCategory.classList.add('categorySpan');
          spanCategory.innerText = 'Category: ' + el.category;
          const spanPriority = document.createElement('span');
          spanPriority.classList.add('prioritySpan');
          spanPriority.innerText = 'Priority: ' + el.priority;

          bookData.appendChild(spanTitle);
          bookData.appendChild(spanAuthor);
          bookData.appendChild(spanCategory);
          bookData.appendChild(spanPriority);

          const bookActionsContainer = document.createElement('div');
          bookActionsContainer.classList.add('bookActionsContainer');
          containerBook.appendChild(bookActionsContainer);

          const btnEdit = document.createElement('input');
          btnEdit.classList.add('btnEdit');
          btnEdit.setAttribute('type', 'image');
          btnEdit.setAttribute('src', '/static/img/edit.svg');

          const btnDel = document.createElement('input');
          btnDel.classList.add('btnDelete');
          btnDel.setAttribute('type', 'image');
          btnDel.setAttribute('src', '/static/img/x.svg');
          bookActionsContainer.appendChild(btnEdit);
          bookActionsContainer.appendChild(btnDel);
        });
      }
    };
    const getBooksCollection = async () => {
      let booksCollection;
      await db
        .collection('users')
        .doc(user.uid)
        .get()
        .then((snapshot) => {
          booksCollection = snapshot.data().BooksCollection;
          // console.log(booksCollection);
          renderData = booksCollection;
        });
      renderColection(renderData);
    };

    if (collectionForm) {
      collectionForm.addEventListener('submit', async (e) => {
        const book = {
          title: titleInput.value,
          author: authorInput.value,
          category: select.value,
          priority: selectPriority.value,
        };
        e.preventDefault();
        await addBookToDataBase(book);
        collectionForm.reset();
        await getBooksCollection();
      });
    }

    selectSort.addEventListener('change', () => {
      sortType = selectSort.value;
      renderColection(renderData);
    });

    inputSearch.addEventListener('oninput', () => {
      // console.log(inputSearch.value);
      filterBooks(books);
    });

    getBooksCollection();
  });

  if (collectionForm) {
    collectionForm.addEventListener('submit', (e) => {
      e.preventDefault();
    });
  }
};

export { dashboardScript };
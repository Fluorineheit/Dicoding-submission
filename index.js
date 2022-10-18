const books = [];

const STORAGE_KEY = 'BOOKSHELF_APP';
const RENDER_EVENT = 'render-books';
const SAVED_EVENT = 'saved-book';

// generate new id for new book
const generateId = () => {
    return +new Date();
};

//generate book infomation or book object
const generateBookObject = (id, title, author, year, isCompleted) => {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    };
};

//inserting the book
const makeBook = (bookObj) =>{
    // init inner info
    const textTitle = document.createElement('h2');
    textTitle.innerText = bookObj.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = bookObj.author;

    const textYear = document.createElement('p');
    textYear.innerText = bookObj.year;

    // init text container
    const textContainer = document.createElement('article');
    textContainer.classList.add('book_items');
    textContainer.setAttribute('id',`${bookObj.id}`);
    textContainer.append(textTitle, textAuthor, textYear);


    //remove book 
    const removeBookButton = document.createElement('button');
    removeBookButton.classList.add('button', 'btn-red');
    removeBookButton.innerText = "Remove";

    removeBookButton.addEventListener('click',()=>{
        delete_notif();
        removeBookFromCompleted(bookObj.id);
    });

    // book option / button wrapper
    const bookOption = document.createElement('div');
    bookOption.classList.add('book-option','flex');

    // isComplete section
    if (bookObj.isCompleted) {

        //undo book from complete
        const unfinishBookButton = document.createElement('button');
        unfinishBookButton.classList.add('button');
        unfinishBookButton.innerText = "Cancel";

        unfinishBookButton.addEventListener('click',()=>{
            undoBookFromFinish(bookObj.id);
        });

        bookOption.append(unfinishBookButton);

    } else {
        //complete book 
        const finishedBookButton = document.createElement('button');
        finishedBookButton.classList.add('button');
        finishedBookButton.innerText = "Complete";

        finishedBookButton.addEventListener('click',()=>{
            addBookToComplete(bookObj.id);
        });

        bookOption.append(finishedBookButton);
    }

    
    bookOption.append(removeBookButton);
    textContainer.append(bookOption);

    return textContainer;

};

// generate new book
const addBook = () => {
    //init inputs
    const bookTitleForm = document.getElementById('new-title-form').value;
    const bookAuthorForm = document.getElementById('new-author-form').value;
    const bookYearForm = document.getElementById('new-year-form').value;
    
    //init id & obj
    const isChecked = isAlreadyFinish();
    const bookID = generateId();
    const bookObject = generateBookObject(bookID, bookTitleForm, bookAuthorForm, bookYearForm, isChecked);

    //add new object
    books.push(bookObject);

    //dispatch
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

};

const addBookToComplete = (bookID) => {
    const bookSelect = findBook(bookID);

    if(bookSelect == null) {return};

    bookSelect.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
};

const undoBookFromFinish = (bookID) => {
    const bookSelect = findBook(bookID);

    if(bookSelect == null) {return};

    bookSelect.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
};

const removeBookFromCompleted = (bookID) => {
    const bookSelect = findBookIndex(bookID);

    if(bookSelect == -1) {return};

    books.splice(bookSelect, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
};

const findBook = (bookID) => {
    for(const items of books) {
        if(items.id === bookID){
            return items;
        }
    }
    return null;
};

const findBookIndex = (bookID) => {
    for(const items in books) {
        if(books[items].id === bookID){
            return items;
        }
    }
    return -1;
};

const delete_notif = () => { 
    const notificationSection = document.getElementById('notification')
    const notifContainer = document.createElement('div');
    const text = document.createElement('p');

    notifContainer.classList.add('delete_notif', 'flex');
    text.innerText = "A book has been deleted";

    notifContainer.append(text);
    notificationSection.append(notifContainer);

    setTimeout(()=> notifContainer.parentNode.removeChild(notifContainer), 2000);

    return notificationSection;
};

// add or remove picture for empty list
const emptySection = () => {
    const empty = document.querySelectorAll('#empty-section');
    const uncompleteBooks = document.getElementById('uncomplete_books');
    const completedBooks = document.getElementById('completed_books');

    for(items of empty){
        if (uncompleteBooks.children.length > 0 || completedBooks.children.length > 0) {
            items.style.display = 'none';
        } else {
            items.style.display = 'inline-block';
        }
    }
}

// checking the checkbox 
const isAlreadyFinish = () => {
    const isChecked = document.getElementById('finished-book');
    console.log(isChecked.checked);
    if(isChecked.checked === true) {
        return true;
    } else {
        return false;
    }
};

// searh bar section
const searchFilter = () => {
    const searchButton = document.getElementById('filter_submit');
    searchButton.addEventListener('click', (e) => {
        e.preventDefault();
        const searchBook = document.getElementById('new-filter-input').value.toLowerCase();
        const bookList = document.querySelectorAll('article h2');
        for (items of bookList) {
            if (items.innerText.toLowerCase().includes(searchBook)) {
                items.parentElement.style.display = 'block';
            } else {
                items.parentElement.style.display = 'none';
            }
        }
    });
}

document.addEventListener('DOMContentLoaded',()=>{
    const formSubmit = document.getElementById('book-input-section');
    formSubmit.addEventListener('submit',(e)=>{
        addBook();
        formSubmit.reset();
    });

    if(isStorageExits()){
        loadData();
    };

    searchFilter();

    emptySection();
});

// init storage
document.addEventListener(SAVED_EVENT,()=>{
    console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener(RENDER_EVENT,()=>{
    const uncompleteBook = document.getElementById('uncomplete_books');
    uncompleteBook.innerHTML = '';

    const completedBook = document.getElementById('completed_books');
    completedBook.innerHTML = '';

    for(const items of books) {
        const bookElement = makeBook(items);

        if(!items.isCompleted){
            uncompleteBook.append(bookElement);
        } else {
            completedBook.append(bookElement);
        };
    };
});

const saveData = () => {
    if(isStorageExits()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    };
};

const loadData = () => {
    const getData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(getData);

    if (data !== null) {
        for(const items of data) {
            books.push(items);
        };
    };

    document.dispatchEvent(new Event(RENDER_EVENT));
};

// checking if storage available
const isStorageExits = () => {
    if(typeof(Storage) === undefined) {
        alert("Browser didn't support local storage");
        return false;
    }
    return true;
};
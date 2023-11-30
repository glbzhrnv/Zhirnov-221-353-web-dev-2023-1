document.addEventListener('DOMContentLoaded', function () {
    const factsList = document.querySelector('.facts-list');
    const perPageBtn = document.querySelector('.per-page-btn');
    const searchForm = document.querySelector('.search-form');
    const paginationContainer = document.querySelector('.pagination');
    const autocompleteOptions = document.getElementById('autocomplete-options');

    function createElementWithClassAndText(elementName, className, text) {
        const element = document.createElement(elementName);
        element.classList.add(className);
        element.textContent = text;
        return element;
    }

    function createListItemElement(record) {
        const itemElement = document.createElement('div');
        itemElement.classList.add('facts-list-item');

        const contentElement = createElementWithClassAndText('div', 'item-content', record.text);
        const footerElement = document.createElement('div');
        footerElement.classList.add('item-footer');

        const authorElement = createElementWithClassAndText('div', 'author-name', `${record.user.name.first} ${record.user.name.last}`);
        const upvotesElement = createElementWithClassAndText('div', 'upvotes', record.upvotes);

        footerElement.appendChild(authorElement);
        footerElement.appendChild(upvotesElement);

        itemElement.appendChild(contentElement);
        itemElement.appendChild(footerElement);

        return itemElement;
    }

    function renderRecords(records) {
        factsList.innerHTML = '';
        for (const record of records) {
            factsList.appendChild(createListItemElement(record));
        }
    }

    function setPaginationInfo(info) {
        document.querySelector('.total-count').textContent = info.total_count;
        const start = info.total_count && (info.current_page - 1) * info.per_page + 1;
        document.querySelector('.current-interval-start').textContent = start;
        const end = Math.min(info.total_count, start + info.per_page - 1);
        document.querySelector('.current-interval-end').textContent = end;
    }

    function createPageBtn(page, classes = []) {
        const btn = createElementWithClassAndText('button', 'btn', page);
        btn.dataset.page = page;
        btn.classList.add(...classes);
        return btn;
    }

    function renderPaginationElement(info) {
        paginationContainer.innerHTML = '';

        const firstPageBtn = createPageBtn(1, ['first-page-btn']);
        firstPageBtn.textContent = 'Первая страница';
        if (info.current_page === 1) {
            firstPageBtn.style.visibility = 'hidden';
        }
        paginationContainer.appendChild(firstPageBtn);

        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('pages-btns');
        paginationContainer.appendChild(buttonsContainer);

        const start = Math.max(info.current_page - 2, 1);
        const end = Math.min(info.current_page + 2, info.total_pages);
        for (let i = start; i <= end; i++) {
            const btn = createPageBtn(i, i === info.current_page ? ['active'] : []);
            buttonsContainer.appendChild(btn);
        }

        const lastPageBtn = createPageBtn(info.total_pages, ['last-page-btn']);
        lastPageBtn.textContent = 'Последняя страница';
        if (info.current_page === info.total_pages) {
            lastPageBtn.style.visibility = 'hidden';
        }
        paginationContainer.appendChild(lastPageBtn);
    }

    function getAutocompleteOptions(query) {
        autocompleteOptions.innerHTML = '';

        if (query.length === 0) {
            return;
        }

        const autocompleteUrl = `http://cat-facts-api.std-900.ist.mospolytech.ru/autocomplete?q=${query}`;

        fetch(autocompleteUrl)
            .then(response => response.json())
            .then(data => {
                data.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option;
                    autocompleteOptions.appendChild(optionElement);
                });
            })
            .catch(error => console.error('Autocomplete fetch error:', error));
    }

    function downloadData(page = 1, query = '') {
        const url = new URL(factsList.dataset.url);
        const perPage = perPageBtn.value;
        url.searchParams.append('page', page);
        url.searchParams.append('per-page', perPage);
        if (query) {
            url.searchParams.append('q', query);
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                renderRecords(data.records);
                setPaginationInfo(data['_pagination']);
                renderPaginationElement(data['_pagination']);
            })
            .catch(error => console.error('Fetch error:', error));
    }

    function perPageBtnHandler() {
        downloadData(1);
    }

    function pageBtnHandler(event) {
        if (event.target.dataset.page) {
            downloadData(event.target.dataset.page);
            window.scrollTo(0, 0);
        }
    }

    function searchFormHandler(event) {
        event.preventDefault();
        const searchField = document.querySelector('.search-field');
        const query = searchField.value.trim();
        downloadData(1, query);

        // Добавляем вызов функции для получения автодополнений
        getAutocompleteOptions(query);
    }

    perPageBtn.addEventListener('change', perPageBtnHandler);
    paginationContainer.addEventListener('click', pageBtnHandler);
    searchForm.addEventListener('submit', searchFormHandler);

    // Добавляем слушатель для автодополнений при вводе
    document.querySelector('.search-field').addEventListener('input', function (event) {
        getAutocompleteOptions(event.target.value);
    });

    // Скрываем автодополнения при выборе варианта
    document.querySelector('.search-field').addEventListener('change', function () {
        autocompleteOptions.innerHTML = '';
    });

    // Initial data download on page load
    downloadData();
});

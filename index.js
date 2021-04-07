
const ListRendering = {
    data() {
        return {
            isbns: {
                // 123: { status: "found", isbn: 123, 
                // data: { "publishers": ["Nintendo of America Inc."], "weight": "1.4 pounds", "covers": [954636], 
                // "physical_format": "Paperback", "last_modified": { "type": "/type/datetime", 
                // "value": "2011-04-26T12:10:44.691604" }, "latest_revision": 7, 
                // "key": "/books/OL8799045M", "authors": [{ "key": "/authors/OL3100384A" }], 
                // "isbn_13": ["9781930206588"], 
                // "title": "Official Nintendo Pokemon Emerald Player's Guide", 
                // "identifiers": { "librarything": ["1860295"], "goodreads": ["391900"] }, 
                // "created": { "type": "/type/datetime", "value": "2008-04-30T08:14:56.482104" }, 
                // "languages": [{ "key": "/languages/eng" }], "isbn_10": ["1930206585"], 
                // "publish_date": "April 18, 2005", "oclc_numbers": ["60694937"], 
                // "works": [{ "key": "/works/OL8950823W" }], "type": { "key": "/type/edition" }, 
                // "physical_dimensions": "10.6 x 8.3 x 0.3 inches", "revision": 7 } }
            },
            inputText: "",
            linksAndLabels: [
                {link: "https://www.openlibrary.org/isbn/", label: "Open Library"},
                {link: "https://www.google.com/search?q=", label: "Google"},
                {link: "https://www.google.com/search?tbm=isch&q=", label: "Google Images"},
                {link: "https://www.gettextbooks.com/search/?isbn=", label: "GetTextbooks"},
                {link: "https://www.amazon.com/s?k=", label: "Amazon"},
            ]
        }
    },
    mounted() {
        this.focusInput();
    },
    methods: {
        getImgUrl(book) {
            if (book.data.covers !== undefined && book.data.covers.length > 0) {
                return `https://covers.openlibrary.org/b/id/${book.data.covers[0]}-M.jpg`;
            }
            return ""
        },
        getAllISBNs(string){
            function getISBN13(string){
                // Given a string of text, extract all isbn13
                // ISBN 13 defined as 13 consecutive digits that may or may not be separated by dashes or spaces
                const matches = string.match(/(?:(-| )?\d){13}/g);
                return matches === null ? [] : matches;
            }
            function getISBN10(string){
                // Return all isbn 10 matches
                const matches = string.match(/(?:(-| )?\d){9}(?:(-| )?(\d|[xX])){1}/g)
                return matches === null ? [] : matches;
            }
            function removeFromString(string, toRemoveArr){
                let workingString = string;
                toRemoveArr.forEach(str=>workingString = workingString.replace(str,""))
                return workingString;
            }
            function cleanISBN(isbn){
                // make the x uppercase and remove spaces and dashes
                return isbn.replace(/x/g, "X").replace(/ |-/g, "");
            }
            const isbn13s = getISBN13(string);
            let workingString = removeFromString(string, isbn13s);
            const isbn10s = getISBN10(workingString);
            const cleanedIsbns = isbn13s.concat(isbn10s).map(isbn=>cleanISBN(isbn))
            return [...new Set(cleanedIsbns)]; // this removes duplicates
        },
        startSearch() {
            const isbns = this.getAllISBNs(this.inputText);
            console.log(isbns);
            const vueisbndata = this.isbns;
            isbns.forEach(value => {
                vueisbndata[value] = { isbn: value, status: "loading", data: { title: '' } }
                this.loadDataFromOpenLibrary(value)
            })
        },
        loadDataFromOpenLibrary(isbn){
            console.log("Fetching from open library", isbn)
            fetch(`https://openlibrary.org/search.json?q=${isbn}`)
            .then(response=>response.json())
            .then(data=>{this.handleSearchResponse(isbn, data)})
        },
        handleSearchResponse(isbn, response){
            if (response['numFound'] == 0){
                this.isbns[isbn].status = 'Not Found'
            } else {
                this.isbns[isbn].status = 'Found'
                this.isbns[isbn].data.title = response['docs'][0].title;
                if (response['docs'][0].cover_i !== undefined){
                    this.isbns[isbn].data.covers = [response['docs'][0].cover_i];
                }
            }
        },
        clear(){
            this.inputText = "";
            this.isbns = {};
            this.focusInput()
        },
        focusInput(){
            this.$refs.input.focus();
        }
    }
}

Vue.createApp(ListRendering).mount('#list-rendering')
import * as cheerio from 'cheerio';
import fs from 'fs';

const scrapeBibleChapterData = async (bookId, chapterNo) => {
    // load from a url
    const url = `https://bible.codesdone.com/?bookId=${bookId}&chapterNo=${chapterNo}&version=1954`;
    // const html = await fetch(url).then(res => res.text());
    // fetch with cookies
    const html = await fetch(url, {
        headers: {
            'cookie': ''
        }
    }).then(res => res.text());

    const $ = cheerio.load(html);

    // load html of class "panel-body"
    const title = $('.panel-body div h3').text();
    const sub_title = $('.panel-body div h4').text();
    const verse_section_children = $('.panel-body div').children()

    let chapterData = {
        bookId: bookId,
        chapter_no: chapterNo,
        title: title || "",
        sub_title: sub_title || "",
        verses: []
    }

    for (let i = 0; i < verse_section_children.length; i++) {
        let verse_child = verse_section_children[i];

        let hasIndent = false;
        if (verse_child.type === 'tag' && verse_child.name === 'span') {
            // check if span has class "indent" to determine if it has an indent
            if (verse_child.attribs.class === 'text-indent') {
                hasIndent = true;
            }

            const $verse_section = cheerio.load(verse_child);
            const verse_num = $verse_section('span sup').first().text();
            const verse_text = $verse_section('span').last().text();

            if (!verse_num || !verse_text) {
                throw new Error('Verse number or text is empty');
            }

            chapterData.verses.push({
                hasIndent,
                verse_num: parseInt(verse_num),
                verse_text: verse_text
            });
        }
    }

    if (chapterData.verses.length === 0) {
        throw new Error('No verses found');
    }

    return chapterData;
}

const bibleBooks = [
    { id: 1, name: 'Genesis', num_of_chapters: 50 },
    { id: 2, name: 'Exodus', num_of_chapters: 40 },
    { id: 3, name: 'Leviticus', num_of_chapters: 27 },
    { id: 4, name: 'Numbers', num_of_chapters: 36 },
    { id: 5, name: 'Deuteronomy', num_of_chapters: 34 },
    { id: 6, name: 'Joshua', num_of_chapters: 24 },
    { id: 7, name: 'Judges', num_of_chapters: 21 },
    { id: 8, name: 'Ruth', num_of_chapters: 4 },
    { id: 9, name: '1 Samuel', num_of_chapters: 31 },
    { id: 10, name: '2 Samuel', num_of_chapters: 24 },
    { id: 11, name: '1 Kings', num_of_chapters: 22 },
    { id: 12, name: '2 Kings', num_of_chapters: 25 },
    { id: 13, name: '1 Chronicles', num_of_chapters: 29 },
    { id: 14, name: '2 Chronicles', num_of_chapters: 36 },
    { id: 15, name: 'Ezra', num_of_chapters: 10 },
    { id: 16, name: 'Nehemiah', num_of_chapters: 13 },
    { id: 17, name: 'Esther', num_of_chapters: 10 },
    { id: 18, name: 'Job', num_of_chapters: 42 },
    { id: 19, name: 'Psalms', num_of_chapters: 150 },
    { id: 20, name: 'Proverbs', num_of_chapters: 31 },
    { id: 21, name: 'Ecclesiastes', num_of_chapters: 12 },
    { id: 22, name: 'Song of Solomon', num_of_chapters: 8 },
    { id: 23, name: 'Isaiah', num_of_chapters: 66 },
    { id: 24, name: 'Jeremiah', num_of_chapters: 52 },
    { id: 25, name: 'Lamentations', num_of_chapters: 5 },
    { id: 26, name: 'Ezekiel', num_of_chapters: 48 },
    { id: 27, name: 'Daniel', num_of_chapters: 12 },
    { id: 28, name: 'Hosea', num_of_chapters: 14 },
    { id: 29, name: 'Joel', num_of_chapters: 3 },
    { id: 30, name: 'Amos', num_of_chapters: 9 },
    { id: 31, name: 'Obadiah', num_of_chapters: 1 },
    { id: 32, name: 'Jonah', num_of_chapters: 4 },
    { id: 33, name: 'Micah', num_of_chapters: 7 },
    { id: 34, name: 'Nahum', num_of_chapters: 3 },
    { id: 35, name: 'Habakkuk', num_of_chapters: 3 },
    { id: 36, name: 'Zephaniah', num_of_chapters: 3 },
    { id: 37, name: 'Haggai', num_of_chapters: 2 },
    { id: 38, name: 'Zechariah', num_of_chapters: 14 },
    { id: 39, name: 'Malachi', num_of_chapters: 4 },
    
    { id: 40, name: 'Matthew', num_of_chapters: 28 },
    { id: 41, name: 'Mark', num_of_chapters: 16 },
    { id: 42, name: 'Luke', num_of_chapters: 24 },
    { id: 43, name: 'John', num_of_chapters: 21 },
    { id: 44, name: 'Acts', num_of_chapters: 28 },
    { id: 45, name: 'Romans', num_of_chapters: 16 },
    { id: 46, name: '1 Corinthians', num_of_chapters: 16 },
    { id: 47, name: '2 Corinthians', num_of_chapters: 13 },
    { id: 48, name: 'Galatians', num_of_chapters: 6 },
    { id: 49, name: 'Ephesians', num_of_chapters: 6 },
    { id: 50, name: 'Philippians', num_of_chapters: 4 },
    { id: 51, name: 'Colossians', num_of_chapters: 4 },
    { id: 52, name: '1 Thessalonians', num_of_chapters: 5 },
    { id: 53, name: '2 Thessalonians', num_of_chapters: 3 },
    { id: 54, name: '1 Timothy', num_of_chapters: 6 },
    { id: 55, name: '2 Timothy', num_of_chapters: 4 },
    { id: 56, name: 'Titus', num_of_chapters: 3 },
    { id: 57, name: 'Philemon', num_of_chapters: 1 },
    { id: 58, name: 'Hebrews', num_of_chapters: 13 },
    { id: 59, name: 'James', num_of_chapters: 5 },
    { id: 60, name: '1 Peter', num_of_chapters: 5 },
    { id: 61, name: '2 Peter', num_of_chapters: 3 },
    { id: 62, name: '1 John', num_of_chapters: 5 },
    { id: 63, name: '2 John', num_of_chapters: 1 },
    { id: 64, name: '3 John', num_of_chapters: 1 },
    { id: 65, name: 'Jude', num_of_chapters: 1 },
    { id: 66, name: 'Revelation', num_of_chapters: 22 }
]

// for loop to scrape all chapters
for (let i = 0; i < bibleBooks.length; i++) {
    const book = bibleBooks[i];
    book.chapters = [];
    console.info(`Scraped book: ${book.name}`);
    for (let j = 1; j <= book.num_of_chapters; j++) {
        const shiftedBookId = book.id + 2;
        const chapter = await scrapeBibleChapterData(shiftedBookId, j);
        bibleBooks[i].chapters.push(chapter);
        console.info(`Scraped chapter ${j}`);
    }
    // save to file
    fs.writeFileSync('bible_books.json', JSON.stringify(bibleBooks, null, 2));
}


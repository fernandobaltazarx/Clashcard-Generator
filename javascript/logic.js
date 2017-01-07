;(function(exports) {
  function loadFromArray(array) {
    clashcards.flashcards = array;
    resetBuckets();
  }

  function loadFromBrowser(selector, delimiter) {
    var flashcards = [],
        userInput  = $(selector).val().split('\n');

    
    userInput = userInput.filter(function(card) {
       return card !== "";
     });

    if (userInput.length === 0) {
      return;
    }

    userInput.forEach(function(card) {
      var parsedCard = card.split(delimiter);
      flashcards.push({question: parsedCard[0], answer: parsedCard[1]});
    });

    clashcards.flashcards = flashcards;
    resetBuckets();
    return getFromLS();
  }

  function next() {
    var newQuestion,
        bigInterval   = Math.ceil(clashcards.flashcards.length / 3) + 1,
        smallInterval = Math.ceil(clashcards.flashcards.length / 6) + 1;

    
    
    if (clashcards.counter % bigInterval === 0 && clashcards.bucketC.length !== 0) {
      newQuestion = getQuestion(clashcards.bucketC);
      clashcards.currentBucket = clashcards.bucketC;

    
    
    } else if (clashcards.counter % smallInterval === 0 && clashcards.bucketB.length !== 0) {
      newQuestion = getQuestion(clashcards.bucketB);
      clashcards.currentBucket = clashcards.bucketB;

    
    } else if (clashcards.bucketA.length !== 0) {
      newQuestion = getQuestion(clashcards.bucketA);
      clashcards.currentBucket = clashcards.bucketA;

    
    } else if (clashcards.bucketB.length !== 0) {
      newQuestion = getQuestion(clashcards.bucketB);
      clashcards.currentBucket = clashcards.bucketB;

    
    } else if (clashcards.bucketC.length !== 0) {
      newQuestion = getQuestion(clashcards.bucketC);
      clashcards.currentBucket = clashcards.bucketC;
    } else {
    }

    
    clashcards.counter >= clashcards.flashcards.length ? clashcards.counter = 1 : clashcards.counter++;
    return newQuestion;
  }

  function correct() {
    if (clashcards.currentBucket === clashcards.bucketA) {
      moveQuestion(clashcards.bucketA, clashcards.bucketB);
    } else if (clashcards.currentBucket === clashcards.bucketB) {
      moveQuestion(clashcards.bucketB, clashcards.bucketC);
    } else if (clashcards.currentBucket === clashcards.bucketC) {
      moveQuestion(clashcards.bucketC, clashcards.bucketC);
    } else
    saveToLS();
  }

  function wrong() {
    moveQuestion(clashcards.currentBucket, clashcards.bucketA);
    saveToLS();
  }

  function moveQuestion(fromBucket, toBucket) {
    toBucket.push(fromBucket.shift());
  }

  function getQuestion(bucket) {
    
    if (!bucket || bucket.length === 0) {
      return;
    }

    return buildQuestionHTML(bucket[0]);
  }

  function buildQuestionHTML(rawQuestion) {
    var questionEl, answerEl;

    questionEl = document.createElement('p');
    questionEl.innerHTML = rawQuestion.question;

    answerEl = document.createElement('p');
    answerEl.innerHTML = rawQuestion.answer.replace(/\n/g, '<br>');

    return {question: questionEl, answer: answerEl};
  }

  function saveToLS() {
    localStorage.flashcards = JSON.stringify(clashcards.flashcards);
    localStorage.bucketA    = JSON.stringify(clashcards.bucketA);
    localStorage.bucketB    = JSON.stringify(clashcards.bucketB);
    localStorage.bucketC    = JSON.stringify(clashcards.bucketC);
  }

  function getFromLS() {
    clashcards.flashcards    = JSON.parse(localStorage.flashcards || '[]');
    clashcards.bucketA       = JSON.parse(localStorage.bucketA    || '[]');
    clashcards.bucketB       = JSON.parse(localStorage.bucketB    || '[]');
    clashcards.bucketC       = JSON.parse(localStorage.bucketC    || '[]');
    clashcards.currentBucket = clashcards.bucketA.length ? clashcards.bucketA :
                         clashcards.bucketB.length ? clashcards.bucketB :
                         clashcards.bucketC.length ? clashcards.bucketC : [];

    clashcards.counter = 1;
    return {flashcards: clashcards.flashcards, bucketA: clashcards.bucketA, bucketB: clashcards.bucketB, bucketC: clashcards.bucketC};
  }

  function resetBuckets() {
    clashcards.bucketA       = clashcards.flashcards.slice(0);
    clashcards.currentBucket = clashcards.bucketA;
    clashcards.bucketB       = [];
    clashcards.bucketC       = [];
    clashcards.counter       = 1;
    saveToLS();
  }

  exports.clashcards = {
    currentBucket:      [],
    flashcards:         [],
    bucketA:            [],
    bucketB:            [],
    bucketC:            [],
    counter:            1,
    loadFromArray:      loadFromArray,
    loadFromBrowser:    loadFromBrowser,
    next:               next,
    correct:            correct,
    wrong:              wrong,
    moveQuestion:       moveQuestion,
    getQuestion:        getQuestion,
    buildQuestionHTML:  buildQuestionHTML,
    saveToLS:           saveToLS,
    getFromLS:          getFromLS,
    resetBuckets:       resetBuckets
  };


  var showNext = function() {
    var result = next();
    $('#current-question').first().html(result['question']);
    $('#current-answer').first().hide().html(result['answer']);
  };

  $.fn.clashcards = function() {
    var result = [];
    this.find('ul').hide().children().each(function() {
      result.push({
        question: $(this).find('.question').html(),
        answer: $(this).find('.answer').html()
      });
    });
    
    loadFromArray(result);

    $('a#correct').click(function(event) {
      event.preventDefault();
      correct();
      showNext();
    });

    $('a#wrong').click(function(event) {
      event.preventDefault();
      wrong();
      showNext();
    });

    $('a#show-answer').click(function(event){
      event.preventDefault();
      $('#current-answer').first().show();
    });

    showNext();
  };

})(this);
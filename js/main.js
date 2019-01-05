async function getReferencesAsync(articleID) {
    // Async/Await approach

    // The async keyword will automatically create a new Promise and return it.

        // The await keyword saves us from having to write a .then() block.
    let json = await axios.get("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=pubmed&linkname=pubmed_pubmed_refs&retmode=json&id=" + articleID + "&api_key=tool=my_tool&email=my_email@example.com");

    var obj = JSON.parse(json.responseText);

    return obj.linksets[0].linksetdbs[0].links;
}

//Get references for a given article by ID, this is the classical synchronous method
 function getReferences(articleID) {

    var responseContainer = document.getElementById('response');
    var request = new XMLHttpRequest();
     request.open("get", "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=pubmed&linkname=pubmed_pubmed_refs&retmode=json&id=" + articleID + "&api_key=tool=my_tool2&email=my_email@example.com", false);
     request.send();

    var obj = JSON.parse(request.responseText);

    return obj.linksets[0].linksetdbs[0].links;

}

//Not all articles are referenced, this checks if they do
async function doesArticleHaveReferences(articleID) {

    var responseContainer = document.getElementById('response');
    var request = new XMLHttpRequest();
    request.open("get", "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=pubmed&linkname=pubmed_pubmed_refs&retmode=json&id=" + articleID + "&api_key=tool=my_tool2&email=my_email@example.com", false);
    request.send();
    var obj = JSON.parse(request.responseText);

    var contains = obj.linksets[0].hasOwnProperty("linksetdbs");

    return contains;
}


//Get any article details by pubmed ID
async function getArticleDetails(articleID) {
    var responseContainer = document.getElementById('response');
    var request = new XMLHttpRequest();
    request.open("get", "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&rettype=abstract&id=" + articleID, false);
    request.send();
    var obj = JSON.parse(request.responseText);
    return obj.result[articleID].uid;
}


//Build the tree, this function only does one level down
function BuildTree(startingArticleID) {

    //var hasrefs = doesArticleHaveReferences("1396582");

    var references = getReferences(startingArticleID);

    var treeString = "[{\"name\":" + "\"" +  startingArticleID + "\"" + ",\"parent\":\"null\",\"children\":[";

    references.forEach(function (ref) {

        if (ref == references[references.length-1]){
            treeString += "{\"name\":" + "\"" + ref + "\"" + ",\"parent\":" + "\"" + startingArticleID + "\"" + "}]}]";
        }
        else {

            treeString += "{\"name\":" + "\"" + ref + "\"" + ",\"parent\":" + "\"" + startingArticleID + "\"" + "},";
        }

    });

    return treeString;
}

//This function does not work properly because of async. Build the tree, with all the possible levels
async function BuildTreeAllLevels(startingArticleID) {

    let references = await getReferencesAsync(startingArticleID); 

    var treeString = "[{\"name\":" + "\"" + getArticleDetails(startingArticleID) + "\"" + ",\"parent\":\"null\",\"children\":[";

    references.forEach(function (ref) {

        if (ref == references[references.length - 1]) {
            treeString += "{\"name\":" + "\"" + ref + "\"" + ",\"parent\":" + "\"" + startingArticleID + "\"" + "}]}]";
        }
        else {

            treeString += "{\"name\":" + "\"" + ref + "\"" + ",\"parent\":" + "\"" + startingArticleID + "\"" + "},";
        }

    });

    references.forEach(function (ref) {
            if (doesArticleHaveReferences(ref)) {
                var childReferences = getReferences(ref);
                childReferences.forEach(function (cRef) {

                    if (cRef == childReferences[childReferences.length - 1]) {
                        treeString += "{\"name\":" + "\"" + cRef + "\"" + ",\"parent\":" + "\"" + ref + "\"" + "}]}]";
                    }
                    else {

                        treeString += "{\"name\":" + "\"" + cRef + "\"" + ",\"parent\":" + "\"" + ref + "\"" + "},";
                    }

                });
            }
        });
    
    return treeString;
}

//Test function for when all else fails
function multiply(a, b) {
    return a * b;
}
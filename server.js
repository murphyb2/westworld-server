const express = require("express");
const algoliasearch = require("algoliasearch");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();

app.use(express.json());

// Algolia indexing
const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_KEY
);
const index = client.initIndex(`${process.env.ALGOLIA_INDEX}`);

const episodesJSON = require("./westworld.json")._embedded.episodes;
const algoliaEpisodes = episodesJSON.map(
  ({
    id,
    url,
    name,
    image,
    season,
    number,
    summary,
    airdate,
    runtime,
    _links,
  }) => ({
    objectID: id,
    url,
    name,
    image,
    season,
    episode: number,
    summary: summary.replace(/(<([^>]+)>)/gi, ""), // Strip the html tags from the string
    airdate: Date.parse(airdate),
    runtime,
    _link: _links.self.href,
  })
);

index
  .saveObjects(algoliaEpisodes, {
    autoGenerateObjectIDIfNotExist: true,
  })
  .then(({ objectIDs }) => {
    console.log(objectIDs);
  });

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "dev";

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

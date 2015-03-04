const expect = require('chai').expect;
const _ = require('lodash');

const DB = require('../../../../../fixtures/classes/database');
const bookController = require('../../../../../fixtures/controllers/books');

var req = require('../../../../../fixtures/mocks/express_request');
var readReq;

describe('read', function() {

  beforeEach(function() {
    readReq = req({
      params: {
        id: 1
      },
      // all of this should work without the content-type
      headers: {
        'accept': 'application/vnd.api+json'
      }
    });
    return DB.reset();
  });

  describe('documentStructure', function() {

    describe('topLevel', function() {
      it('must respond to a successful request with an object', function(done) {
        var bookRouteHandler = bookController.read({
          responder: function(payload) {
            expect(payload.code).to.equal('200');
            expect(payload.data).to.be.an('object');
            done();
          }
        });
        bookRouteHandler(readReq);
      });

      it('must respond to an unsuccessful request with a JSON object', function(done) {
        DB.empty().then(function() {
          var bookRouteHandler = bookController.read({
            responder: function(payload) {
              expect(payload.code).to.equal('400');
              expect(payload.data).to.be.an('object');
              expect(payload.data.errors).to.be.an('array');
              done();
            }
          });
          bookRouteHandler(req({
            params: {}
          }));
        });
      });

      it('must place primary data under a top-level key named "data"', function(done) {
        var bookRouteHandler = bookController.read({
          responder: function(payload) {
            expect(payload.code).to.equal('200');
            expect(payload.data).to.have.property('data');
            done();
          }
        });
        bookRouteHandler(readReq);
      });

      it('must make primary data for a single record an object', function(done) {
        var bookRouteHandler = bookController.read({
          one: true,
          filters: {
            id: 1
          },
          responder: function(payload) {
            expect(payload.code).to.equal('200');
            expect(payload.data.data).to.be.an('object');
            done();
          }
        });
        bookRouteHandler(readReq);
      });

      it('must make primary data for multiple records an array', function(done) {
        var bookRouteHandler = bookController.read({
          responder: function(payload) {
            expect(payload.code).to.equal('200');
            expect(payload.data.data).to.be.an('array');
            done();
          }
        });
        bookRouteHandler(readReq);
      });

      it('must not include any top-level members other than "data," "meta," "links," or "linked"', function(done) {
        var allowedTopLevel = ['data', 'linked', 'links', 'meta'];
        var bookRouteHandler = bookController.read({
          responder: function(payload) {
            expect(payload.code).to.equal('200');
            Object.keys(payload.data).forEach(function(key) {
              expect(allowedTopLevel).to.contain(key);
            });
            done();
          }
        });
        bookRouteHandler(readReq);
      });
    });

    describe('resourceObjects', function() {

      describe('resourceAttributes', function() {
        it('must not contain a foreign key as an attribute', function(done) {
          var bookRouteHandler = bookController.read({
            one:true,
            filters: {
              id: 1
            },
            responder: function(payload) {
              var dataObj = payload.data.data;
              expect(payload.code).to.equal('200');
              expect(dataObj).to.be.an('object');
              expect(dataObj).to.not.have.property('author_id');
              expect(dataObj).to.not.have.property('series_id');
              done();
            }
          });
          bookRouteHandler(readReq);
        });

        it('must include relations as linked resources', function(done) {
          var bookRouteHandler = bookController.read({
            one:true,
            filters: {
              id: 1
            },
            responder: function(payload) {
              var dataObj = payload.data.data;
              expect(payload.code).to.equal('200');
              expect(dataObj).to.be.an('object');
              expect(dataObj.links).to.have.property('author');
              expect(dataObj.links).to.have.property('series');
              done();
            }
          });
          bookRouteHandler(readReq);
        });
      });

      // TODO: DB/ORM test
      // describe('resourceIdentification', function() {
      //   it('must have a unique type and id pair');
      // });

      describe('resourceTypes', function() {
        it('must contain a type', function(done) {
          var bookRouteHandler = bookController.read({
            one:true,
            filters: {
              id: 1
            },
            responder: function(payload) {
              expect(payload.code).to.equal('200');
              expect(payload.data.data).to.have.property('type');
              done();
            }
          });
          bookRouteHandler(readReq);
        });

        it('must have a string value for type', function(done) {
          var bookRouteHandler = bookController.read({
            one:true,
            filters: {
              id: 1
            },
            responder: function(payload) {
              expect(payload.code).to.equal('200');
              expect(payload.data.data.type).to.be.a('string');
              done();
            }
          });
          bookRouteHandler(readReq);
        });
      });

      describe('resourceIds', function() {
        it('must contain an id', function(done) {
          var bookRouteHandler = bookController.read({
            one:true,
            filters: {
              id: 1
            },
            responder: function(payload) {
              expect(payload.code).to.equal('200');
              expect(payload.data.data).to.have.property('id');
              done();
            }
          });
          bookRouteHandler(readReq);
        });

        it('must have a string value for type', function(done) {
          var bookRouteHandler = bookController.read({
            one:true,
            filters: {
              id: 1
            },
            responder: function(payload) {
              expect(payload.code).to.equal('200');
              expect(payload.data.data.id).to.be.a('string');
              done();
            }
          });
          bookRouteHandler(readReq);
        });
      });

      describe('links', function() {
        it('must have an object as the value of any links key', function(done) {
          var bookRouteHandler = bookController.read({
            one:true,
            filters: {
              id: 1
            },
            responder: function(payload) {
              expect(payload.code).to.equal('200');
              expect(payload.data.data.links).to.be.an('Object');
              done();
            }
          });
          bookRouteHandler(readReq);
        });
      });

      describe('resourceURLs', function() {
        // OPTIONAL
        // A resource object **MAY** include a URL in its links object,
        // keyed by "self", that identifies the resource represented by
        // the resource object.
        it('may include a string in its links object keyed by "self"', function(done) {
          var bookRouteHandler = bookController.read({
            one:true,
            filters: {
              id: 1
            },
            responder: function(payload) {
              var links = payload.data.data.links;
              expect(payload.code).to.equal('200');
              expect(links).to.have.property('self');
              expect(links.self).to.be.a('String');
              done();
            }
          });
          bookRouteHandler(readReq);
        });

        it('must set the value of "self" to a URL that identifies the resource represented by this object', function(done) {
          var bookRouteHandler = bookController.read({
            one:true,
            filters: {
              id: 1
            },
            responder: function(payload) {
              var links = payload.data.data.links;
              expect(payload.code).to.equal('200');
              expect(links.self).to.equal('/books/1');
              done();
            }
          });
          bookRouteHandler(readReq);
        });

        // TODO: API TEST
        // it('must respond to a get request to any `self` url with the resource as primary data');
      });

      describe('resourceRelationships', function() {
        // OPTIONAL
        // A resource object MAY contain references to other resource
        // objects ("relationships"). Relationships may be to-one or
        // to-many. Relationships can be specified by including a member
        // in a resource's links object.
        it('may contain references to related objects in the links object', function(done) {
          var bookRouteHandler = bookController.read({
            one:true,
            responder: function(payload) {
              var links = payload.data.data.links;
              expect(payload.code).to.equal('200');
              expect(links).to.have.property('author');
              expect(links).to.have.property('series');
              expect(links).to.have.property('stores');
              expect(links).to.have.property('author.books');
              done();
            }
          });
          bookRouteHandler(readReq);
        });

        // TODO: unit test - Endpoints should throw if a model has a
        // relation named 'self'
        // it('shall not have a relationship to another object keyed as "self"');

        // The value of a relationship **MUST** be either a string URL
        // or a link object.
        //
        // Endpoints takes the view that to-many relationships may
        // contain numerous records. By default, it returns link objects
        // for to-one references and string URLs for to-many references.
        it('should make to-one references a link object', function(done) {
          var bookRouteHandler = bookController.read({
            one:true,
            responder: function(payload) {
              var links = payload.data.data.links;
              expect(payload.code).to.equal('200');
              expect(links.author).to.be.an('Object');
              expect(links.series).to.be.an('Object');
              done();
            }
          });
          bookRouteHandler(readReq);
        });

        it('should make to-many references a string URL', function(done) {
          var bookRouteHandler = bookController.read({
            one:true,
            responder: function(payload) {
              var links = payload.data.data.links;
              expect(payload.code).to.equal('200');
              expect(links.stores).to.be.a('String');
              expect(links['author.books']).to.be.a('String');
              expect(links.stores).to.equal('/books/1/stores');
              expect(links['author.books']).to.equal('/books/1/author.books');
              done();
            }
          });
          bookRouteHandler(readReq);
        });

        describe('stringURLRelationship', function() {
          // TODO: implement
          it('should not change related URL even when the resource changes');
        });

        describe('linkObjectRelationship', function() {
          it('must contain either a "self," "resource," "meta" property or an object linkage via a data object or type and id', function(done) {
            var bookRouteHandler = bookController.read({
              one:true,
              responder: function(payload) {
                var linkedAuthor = payload.data.data.links.author;
                var minProp =
                  linkedAuthor.self ||
                  linkedAuthor.resource ||
                  linkedAuthor.meta ||
                  linkedAuthor.data ||
                  (linkedAuthor.type && linkedAuthor.id);
                expect(payload.code).to.equal('200');
                expect(minProp).to.exist;
                done();
              }
            });
            bookRouteHandler(readReq);
          });

          it('must include object linkage to resource objects included in the same compound document', function(done) {
            var bookRouteHandler = bookController.read({
              one:true,
              responder: function(payload) {
                var linkedAuthor = payload.data.data.links.author;
                var objectLinkage =
                  linkedAuthor.data ||
                  (linkedAuthor.type && linkedAuthor.id);

                expect(payload.code).to.equal('200');
                expect(objectLinkage).to.exist;
                done();
              }
            });
            readReq.query = { include: 'author' };
            bookRouteHandler(readReq);
          });

          it('must express object linkages as type and id for to-one relationships', function(done) {
            var bookRouteHandler = bookController.read({
              one:true,
              responder: function(payload) {
                var links = payload.data.data.links;
                expect(payload.code).to.equal('200');
                expect(links.author).to.have.property('type');
                expect(links.author).to.have.property('id');
                done();
              }
            });
            readReq.query = { include: 'author' };
            bookRouteHandler(readReq);
          });

          it('must express object linkages as type and ids for to-many relationships', function(done) {
            // FIXME: This test isn't actually testing what it should
            var bookRouteHandler = bookController.read({
              one:true,
              responder: function(payload) {
                var links = payload.data.data.links;
                expect(payload.code).to.equal('200');
                expect(links.series).to.have.property('type');
                expect(links.series).to.have.property('id');
                done();
              }
            });
            readReq.query = { include: 'series' };
            bookRouteHandler(readReq);
          });

          // We don't do heterogeneous to-many relationships
          // it('must express object linkages as a data member whose value is an array of objects containing type and id for heterogeneous to-many relationships');
        });
      });
    });

    describe('compoundDocuments', function() {
      // An endpoint **MAY** return resources linked to the primary data
      // by default.
      //
      // Endpoints handles this by allowing the API implementer to set
      // default includes in the router. Endpoints will not include
      // linked resources by default.
      //
      // An endpoint MAY also support custom inclusion of linked
      // resources based upon an include request parameter.
      it('must include linked resources as an array of resource objects in a top level `linked` member', function(done) {
        var bookRouteHandler = bookController.read({
          one:true,
          responder: function(payload) {
            var linkedAuthor = payload.data.data.links.author;
            expect(payload.code).to.equal('200');
            expect(payload.data.linked).to.not.have.property('authors');
            expect(payload.data.linked[0].type).to.equal(linkedAuthor.type);
            expect(payload.data.linked[0].id).to.equal(linkedAuthor.id);
            done();
          }
        });
        readReq.query = { include: 'author' };
        bookRouteHandler(readReq);
      });

      it('must not include more than one resource object for each type and id pair', function(done) {
        var bookRouteHandler = bookController.read({
          responder: function(payload) {
            expect(payload.code).to.equal('200');
            expect(payload.data.linked.length).to.equal(2);
            done();
          }
        });
        bookRouteHandler(req({
          params: {},
          query: {
            include: 'author'
          }
        }));
      });
    });

    it('must not include other resource objects in the linked section when the client specifies an include parameter', function(done) {
      var bookRouteHandler = bookController.read({
        one:true,
        include: ['series'],
        responder: function(payload) {
          var linkedTypes = _.pluck(payload.data.linked, 'type');
          expect(payload.code).to.equal('200');
          expect(linkedTypes.indexOf('series')).to.equal(-1);
          done();
        }
      });
      readReq.query = { include: 'author' };
      bookRouteHandler(readReq);
    });

    it('must have the identical relationship name as the key in the links section of the parent resource object', function(done) {
      var bookRouteHandler = bookController.read({
        one:true,
        responder: function(payload) {
          var linksTypes = Object.keys(payload.data.data.links);
          expect(payload.code).to.equal('200');
          expect(linksTypes.indexOf('author')).to.be.at.least(0);
          expect(linksTypes.indexOf('series')).to.be.at.least(0);
          expect(linksTypes.indexOf('stores')).to.be.at.least(0);
          expect(linksTypes.indexOf('author.books')).to.be.at.least(0);
          done();
        }
      });
      readReq.query = { include: 'author,series,stores,author.books' };
      bookRouteHandler(readReq);
    });

    // TODO: Meta object not currently used by endpoints
    // describe('metaInformation', function() {
    //   it('must be an object value');
    // });

    // TODO: Pagination not currently used by endpoints
    // describe('topLevelLinks', function() {
    //   it('should include pagination links if necessary');
    // });
  });

  // These tests have been moved above to 'compoundDocuments'
  // describe('inclusionOfLinkedResources', function() {
  // });

  describe('fetchingResources', function() {

    it('must require an ACCEPT header specifying the JSON API media type', function(done) {
      var bookRouteHandler = bookController.read({
        responder: function(payload) {
          expect(payload.code).to.equal('406');
          done();
        }
      });
      readReq.headers = { accept: '' };
      bookRouteHandler(readReq);
    });

    describe('sparseFieldsets', function() {
      it('should support returning **only** specific fields in the response on a per-type basis by including a fields[TYPE] parameter', function(done) {
        var bookRouteHandler = bookController.read({
          responder: function(payload) {
            var dataObj = payload.data.data[0];
            expect(dataObj).to.have.property('id');
            expect(dataObj).to.have.property('title');
            expect(dataObj).to.not.have.property('date_published');
            done();
          }
        });
        readReq.query = { fields: {books: 'id,title'} };
        bookRouteHandler(readReq);
      });
    });

    describe('sorting', function() {
      it('should support requests to sort collections with a sort query parameter', function(done) {
        var bookRouteHandler = bookController.read({
          responder: function(payload) {
            expect(payload.data.data[0].title).to.equal('Harry Potter and the Chamber of Secrets');
            done();
          }
        });
        delete readReq.params;
        readReq.query = {
          sort: '+title'
        };
        bookRouteHandler(readReq);
      });

      it.skip('should support sorting by nested relationship attributes', function(done) {
        var bookRouteHandler = bookController.read({
          responder: function(payload) {
            expect(payload.data.data[0].title).to.equal('Harry Potter and the Philosopher\'s Stone');
            done();
          }
        });
        delete readReq.params;
        readReq.query = {
          sort: '+author.name'
        };
        bookRouteHandler(readReq);
      });

      it('should sort multiple criteria using comma-separated fields in the order specified', function(done) {
        var bookRouteHandler = bookController.read({
          responder: function(payload) {
            expect(payload.data.data[0].title).to.equal('Harry Potter and the Chamber of Secrets');

            readReq.query = {
              sort: '-date_published,+title'
            };
            secondBookRouteHandler(readReq);
          }
        });
        var secondBookRouteHandler = bookController.read({
          responder: function(payload) {
            expect(payload.data.data[0].title).to.equal('Harry Potter and the Deathly Hallows');
            done();
          }
        });
        delete readReq.params;
        readReq.query = {
          sort: '+title,-date_published'
        };
        bookRouteHandler(readReq);
      });

      it('must sort ascending or descending based on explicit sort order using "+" or "-"', function(done) {
        var bookRouteHandler = bookController.read({
          responder: function(payload) {
            expect(payload.data.data[0].title).to.equal('The Two Towers');
            done();
          }
        });
        delete readReq.params;
        readReq.query = {
          sort: '-title'
        };
        bookRouteHandler(readReq);
      });
    });

    // TODO: Pagination
    // describe('pagination', function() {
    //   it('should limit the number of resources returned in a response to a subset of the whole set available');
    //   it('should provide links to traverse a paginated data set');
    //   it('must put any pagination links on the object that corresponds to a collection');
    //   it('must only use "first," "last," "prev," and "next" as keys for pagination links');
    //   it('must omit or set values to null for links that are unavailable');
    //   it('must remain consistent with the sorting rules');
    // });

    describe('filtering', function() {
      it('must only use the filter query parameter for filtering data', function(done) {
        var bookRouteHandler = bookController.read({
          responder: function(payload) {
            expect(payload.data.data.length).to.equal(2);
            expect(payload.data.data[0].id).to.equal('7');
            expect(payload.data.data[1].id).to.equal('11');
            done();
          }
        });
        delete readReq.params;
        readReq.query = {
          filter: {
            date_published: '2000-07-08,1937-09-21'
          }
        };
        bookRouteHandler(readReq);
      });
    });
  });
});

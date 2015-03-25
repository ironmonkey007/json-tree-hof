describe("json-tree-hof", function() {
    var JsonTreeHof = require('../json-tree-hof');
    var _ = require('lodash');

    beforeEach(function() {
        jth = new JsonTreeHof();
    });

    it("should find leaves one level deep", function() {
        var simpleTreeData = [{
            "name": "mytree",
            "nodes": [{
                "name": "sub1"
            }, {
                "name": "sub2"
            }]
        }];
        var leaves = jth.leaves(simpleTreeData);
        expect(leaves).not.toBe(null);
        expect(leaves.length).toEqual(2);
        expect(_.find(leaves, function(x) {
            return x.name === 'sub1';
        })).toBeDefined();
        expect(_.find(leaves, function(x) {
            return x.name === 'sub2';
        })).toBeDefined();
        expect(_.find(leaves, function(x) {
            return x.name === 'mytree';
        })).toBeUndefined();
    });

    it("should find leaves two levels deep", function() {
        var simpleTreeData = [{
            "name": "mytree",
            "nodes": [{
                "name": "sub1",
                "nodes": [{
                    "name": "twolevels"
                }]
            }, {
                "name": "sub2"
            }]
        }];
        var leaves = jth.leaves(simpleTreeData);
        expect(leaves).not.toBe(null);
        expect(leaves.length).toEqual(2);
        expect(_.find(leaves, function(x) {
            return x.name === 'sub1';
        })).toBeUndefined();
        expect(_.find(leaves, function(x) {
            return x.name === 'sub2';
        })).toBeDefined();
        expect(_.find(leaves, function(x) {
            return x.name === 'twolevels';
        })).toBeDefined();
        expect(_.find(leaves, function(x) {
            return x.name === 'mytree';
        })).toBeUndefined();
    });
    it("should find elements in a list before the first matching a predicate", function() {
        expect(jth.before([1, 2, 3, 4, 5], function(x) {
            return x === 3;
        })).toEqual([1, 2]);
        expect(jth.before([1, 2, 3, 4, 5], function(x) {
            return x === 1;
        })).toEqual([]);
        expect(jth.before([1, 2, 3, 4, 5], function(x) {
            return x === 5;
        })).toEqual([1, 2, 3, 4]);
    });

    it("should find elements in a list after the first matching a predicate", function() {
        expect(jth.after([1, 2, 3, 4, 5], function(x) {
            return x === 3;
        })).toEqual([4, 5]);
        expect(jth.after([1, 2, 3, 4, 5], function(x) {
            return x === 1;
        })).toEqual([2, 3, 4, 5]);
        expect(jth.after([1, 2, 3, 4, 5], function(x) {
            return x === 5;
        })).toEqual([]);
    });

    it("should move up the element matching a predicate", function() {
        expect(jth.moveUp([1, 2, 3, 4, 5], function(x) {
            return x === 3;
        })).toEqual([1, 3, 2, 4, 5]);
        expect(jth.moveUp([1, 2, 3, 4, 5], function(x) {
            return x === 1;
        })).toEqual([1, 2, 3, 4, 5]);
        expect(jth.moveUp([1, 2, 3, 4, 5], function(x) {
            return x === 5;
        })).toEqual([1, 2, 3, 5, 4]);
        expect(jth.moveUp([], function(x) {
            return x === 5;
        })).toEqual([]);
    });
    it("moveDown should do nothing if the predicate does not match", function() {
        expect(jth.moveDown([1, 2, 3, 4, 5], function(x) {
            return false;
        })).toEqual([1, 2, 3, 4, 5]);
    });
    it("moveup should do nothing if the predicate does not match", function() {
        expect(jth.moveUp([1, 2, 3, 4, 5], function(x) {
            return false;
        })).toEqual([1, 2, 3, 4, 5]);
    });
    it("should move down the element matching a predicate", function() {
        expect(jth.moveDown([1, 2, 3, 4, 5], function(x) {
            return x === 3;
        })).toEqual([1, 2, 4, 3, 5]);
        expect(jth.moveDown([1, 2, 3, 4, 5], function(x) {
            return x === 1;
        })).toEqual([2, 1, 3, 4, 5]);
        expect(jth.moveDown([1, 2, 3, 4, 5], function(x) {
            return x === 5;
        })).toEqual([1, 2, 3, 4, 5]);
        expect(jth.moveDown([], function(x) {
            return x === 5;
        })).toEqual([]);
    });

    it("should move up a child branch from the end", function() {
        var t = [{
            "name": "A",
            "id": 100
        }, {
            "name": "B",
            "id": 101
        }];
        var t2 = jth.moveUp(t, function(x) {
            return x.id === 101;
        });
        expect(_.first(t2)).toEqual({
            "name": "B",
            "id": 101
        });
    });

    it("should move up by id a child branch from the end", function() {
        var t = [{
            "name": "A",
            "id": 100
        }, {
            "name": "B",
            "id": 101
        }];
        var matchById = function(id) {
            return (function(x) {
                return x.id === id;
            });
        };
        var t2 = jth.moveUp(t, matchById(101));
        expect(_.first(t2)).toEqual({
            "name": "B",
            "id": 101
        });
    });

    it("should map move up by id a child branch from the end", function() {
        var t = [{
            "name": "A",
            "id": 100
        }, {
            "name": "B",
            "id": 101
        }];
        var moveUpById = function(id) {
            var matchById = function(id) {
                return (function(x) {
                    return x.id === id;
                });
            };
            return function(tree) {
                return jth.moveUp(tree, matchById(id));
            };
        };

        var t2 = moveUpById(101)(t);
        expect(_.first(t2)).toEqual({
            "name": "B",
            "id": 101
        });
    });

    it("should allow moving up a top level item by id", function() {
        var t = [{
            "name": "A",
            "id": 100
        }, {
            "name": "B",
            "id": 101,
            "nodes": [{
                "name": "C",
                "id": 102
            }, {
                "name": "D",
                "id": 103
            }]
        }];
        var result = jth.moveUpById(t, 101);
        expect(result).toBeDefined();
        expect(result[0].name).toEqual("B");
    });

    it("should allow moving up a lower level item by id", function() {
        var t = [{
            "name": "A",
            "id": 100
        }, {
            "name": "B",
            "id": 101,
            "nodes": [{
                "name": "C",
                "id": 102
            }, {
                "name": "D",
                "id": 103
            }]
        }];
        var result = jth.moveUpById(t, 103);
        expect(result).toBeDefined();
        expect(result[1].nodes[0].name).toEqual("D");
    });
    it("should allow moving down a top level item by id", function() {
        var t = [{
            "name": "A",
            "id": 100
        }, {
            "name": "B",
            "id": 101,
            "nodes": [{
                "name": "C",
                "id": 102
            }, {
                "name": "D",
                "id": 103
            }]
        }];
        var result = jth.moveDownById(t, 100);
        expect(result).toBeDefined();
        expect(result[0].name).toEqual("B");
    });

    it("should allow moving down a lower level item by id", function() {
        var t = [{
            "name": "A",
            "id": 100
        }, {
            "name": "B",
            "id": 101,
            "nodes": [{
                "name": "C",
                "id": 102
            }, {
                "name": "D",
                "id": 103
            }]
        }];
        var result = jth.moveDownById(t, 102);
        expect(result).toBeDefined();
        expect(result[1].nodes[0].name).toEqual("D");
    });

    it("should map a function to all lists of nodes", function() {
        var t = [{
            "name": "A",
            "id": 100
        }, {
            "name": "B",
            "id": 101,
            "nodes": [{
                "name": "C",
                "id": 102
            }, {
                "name": "D",
                "id": 103
            }]
        }];
        var changeFirstId = function(x) {
            x[0].id = 99;
            return x;
        };
        var result = jth.mapLists(t, changeFirstId);
        expect(result).toBeDefined();
        expect(result[0].id).toEqual(99);
        expect(result[1].nodes[0].id).toEqual(99);
        expect(result[1].id).toEqual(101);
        expect(jth.mapLists([], changeFirstId)).toEqual([]);
    });

    it("should map a function to all nodes in the tree", function() {

        var t = [{
            "name": "A",
            "id": 100
        }, {
            "name": "B",
            "id": 101,
            "nodes": [{
                "name": "C",
                "id": 102
            }, {
                "name": "D",
                "id": 103
            }]
        }];

        var changeId = function(x) {
            x.id = 99;
            return x;
        };

        var result = jth.mapNodes(t, changeId);
        expect(result).toBeDefined();
        expect(result[0].id).toEqual(99);
        expect(result[1].id).toEqual(99);
        expect(result[1].nodes[0].id).toEqual(99);

        expect(jth.mapNodes([], changeId)).toEqual([]);
    });

    it("should allow a way to get a simplified version of the tree", function() {
        var t = [{
            "name": "A",
            "id": 100
        }, {
            "name": "B",
            "id": 101,
            "nodes": [{
                "name": "C",
                "id": 102
            }, {
                "name": "D",
                "id": 103
            }]
        }];
        var namesOnly = function(x) {
            return _.pick(x, ["name", "nodes"]);
        };
        var result = jth.mapNodes(t, namesOnly);
        expect(result).toEqual([{
            "name": "A"
        }, {
            "name": "B",
            "nodes": [{
                "name": "C"
            }, {
                "name": "D"
            }]
        }]);
    });

    it("should be able to get a flat list of the result of applying a function to all nodes", function() {
        var t = [{
            "name": "A",
            "id": 100
        }, {
            "name": "B",
            "id": 101,
            "nodes": [{
                "name": "C",
                "id": 102
            }, {
                "name": "D",
                "id": 103
            }]
        }];

        function getName (x) {
            return x.name;
        };

        var result = jth.mapToList(t, getName);
        expect(result).toEqual(["A", "B", "C", "D"]);

        expect(jth.mapToList([], getName)).toEqual([]);
    });
    
    it("should be able to reduce across a tree using mapToList combined with _.reduce()", function() {
        var t = [{
            "name": "A",
            "id": 100
        }, {
            "name": "B",
            "id": 101,
            "nodes": [{
                "name": "C",
                "id": 102
            }, {
                "name": "D",
                "id": 103
            }]
        }];

        function getId (x) {
            return x.id;
        };

        var result = _.reduce(jth.mapToList(t, getId), function(acc, n) { return acc + n; });
        expect(result).toEqual(406); // sum of ids
    });
});

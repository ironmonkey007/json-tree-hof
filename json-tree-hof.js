// json-tree-hof.js
// Higher order functions for use with a json-tree
// A json-tree is a list of JSON objects, each of which may optionally
// have a field called "nodes" which is another such list.

if (typeof module == 'undefined') {
    module = {};
}

if (typeof require != 'undefined') {
    var _ = require('lodash');
}

// contentTree module
module.exports = function() {

    var leaves_helper = function(x) {
        if (!x.nodes) {
            return x;
        }
        return _.flatten(_.map(x["nodes"], leaves_helper));
    };

    // flatten the tree into a list of the leaves
    var leaves = function(x) {
        return _.flatten(_.map(x, leaves_helper));
    };


    var nodes_helper = function(x) {
        if (!x.nodes) {
            return x;
        }
        return x.concat(_.flatten(_.map(x["nodes"], leaves_helper)));
    };

    // flatten the tree into a list of all the nodes
    var nodes = function(x) {
        return _.flatten(_.map(x, nodes_helper));
    };

    // e.g. [1, 2, 3,    999,   4, 5] --> [1,2,999,3,4,5]
    //      |beforeItem |item| after|
    var moveUp = function(list, pred) {
        var beforeItem = before(list, pred);
        if (beforeItem.length === 0 || beforeItem.length === list.length) {
            return list;
        }
        var item = _.find(list, pred);
        return _.dropRight(beforeItem).concat(item).concat(_.last(beforeItem)).concat(after(list, pred));
    };

    // e.g. [1, 2, 3,     999,    4, 5   ] --> [1,2,3,4,999,5]
    //      |beforeItem |item| afterItem|
    var moveDown = function(list, pred) {
        var afterItem = after(list, pred);
        if (afterItem.length === 0 || afterItem.length == list.length) {
            return list;
        }
        var item = _.find(list, pred);
        return before(list, pred).concat(_.head(afterItem)).concat(item).concat(_.tail(afterItem));
    };

    // elements in the list before the first one matching pred
    var before = function(list, pred) {
        return _.takeWhile(list, _.negate(pred));
    };

    // elements in the list after the first one matching pred
    var after = function(list, pred) {
        return _.takeRightWhile(list, _.negate(pred));
    };

    // map a function to all lists of nodes in the tree (and return the resulting tree)
    // f is a function that takes a list as an argument and returns a list
    var mapLists = function(tree, f) {
        if (!tree || !tree.length || tree.length === 0) {
            return [];
        }
        for (var i = 0; i < tree.length; i++) {
            if (tree[i].nodes) {
                tree[i].nodes = mapLists(tree[i].nodes, f);
            }

        }
        return f(tree);
    };

    // map a function to a node itself and all descendant nodes
    var mapSelfAndDescendants = function(f, node) {
        if (node.nodes) {
            node.nodes = _.map(node.nodes, _.partial(mapSelfAndDescendants, f));
        }
        return f(node);
    };

    // map a function to each node in the tree (and return the resulting tree)
    // f is a function that takes an object as an argument and returns a node
    var mapNodes = function(tree, f) {
        return _.map(tree, _.partial(mapSelfAndDescendants, f));
    };

    var matchById = function(id) {
        return (function(x) {
            return x.id === id;
        });
    };

    var moveUpByIdHelper = function(id) {
        return function(tree) {
            return moveUp(tree, matchById(id));
        };
    };

    var moveDownByIdHelper = function(id) {
        return function(tree) {
            return moveDown(tree, matchById(id));
        };
    };

    var moveUpById = function(tree, id) {
        return mapLists(tree, moveUpByIdHelper(id));
    };

    var moveDownById = function(tree, id) {
        return mapLists(tree, moveDownByIdHelper(id));
    };

    var map_helper = function(acc, f, node) {
        var result = acc.concat(f(node));
        if (node.nodes) {
            var children = _.map(node.nodes, _.partial(map_helper, acc, f));
            return result.concat(children);
        } else {
            return result;
        }
    };

    // returns a flat list that is the result of applying function f to every node
    var mapToList = function(tree, f) {
        var result = [];
        for (var i = 0; i < tree.length; i++) {
            result.push(map_helper([], f, tree[i]));
        }
        return _.flattenDeep(result);
    };

    exports.leaves = leaves;
    exports.moveUp = moveUp;
    exports.moveDown = moveDown;
    exports.before = before;
    exports.after = after;
    exports.mapLists = mapLists;
    exports.mapNodes = mapNodes;
    exports.moveUpById = moveUpById;
    exports.moveDownById = moveDownById;
    exports.mapToList = mapToList;

    return exports;
};

// name for old style JS to use
var json_tree_hof = module.exports;

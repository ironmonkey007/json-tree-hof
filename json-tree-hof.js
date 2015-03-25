// json-tree-hof.js

// Higher order functions for use with a json-tree
// A json-tree is a list of JSON objects, each of which may optionally
// have a field called "nodes" which is another such list.

if (typeof module == 'undefined') {
    module = {};
}

// assumes that non-require-aware JS must include lodash on its own.
if (typeof require != 'undefined') {
    var _ = require('lodash');
}

// contentTree module
module.exports = function() {

    function leaves_helper (x) {
        if (!x.nodes) {
            return x;
        }
        return _.flatten(_.map(x["nodes"], leaves_helper));
    };

    // flatten the tree into a list of the leaves
    function leaves (x) {
        return _.flatten(_.map(x, leaves_helper));
    };


    function nodes_helper (x) {
        if (!x.nodes) {
            return x;
        }
        return x.concat(_.flatten(_.map(x["nodes"], leaves_helper)));
    };

    // flatten the tree into a list of all the nodes
    function nodes (x) {
        return _.flatten(_.map(x, nodes_helper));
    };

    // Move the first item matching a predicate upward in its containing list.
    // e.g. [1, 2, 3,    999,   4, 5] --> [1,2,999,3,4,5]
    //      |beforeItem |item| after|
    function moveUp (list, pred) {
        var beforeItem = before(list, pred);
        if (beforeItem.length === 0 || beforeItem.length === list.length) {
            return list;
        }
        var item = _.find(list, pred);
        return _.dropRight(beforeItem).concat(item).concat(_.last(beforeItem)).concat(after(list, pred));
    };

    // Move the first item matching a predicate downward in its containing list.
    // e.g. [1, 2, 3,     999,    4, 5   ] --> [1,2,3,4,999,5]
    //      |beforeItem |item| afterItem|
    function moveDown (list, pred) {
        var afterItem = after(list, pred);
        if (afterItem.length === 0 || afterItem.length == list.length) {
            return list;
        }
        var item = _.find(list, pred);
        return before(list, pred).concat(_.head(afterItem)).concat(item).concat(_.tail(afterItem));
    };

    // elements in the list before the first one matching pred
    function before (list, pred) {
        return _.takeWhile(list, _.negate(pred));
    };

    // elements in the list after the first one matching pred
    function after (list, pred) {
        return _.takeRightWhile(list, _.negate(pred));
    };

    // Map a function to all lists of nodes in the tree (and return the resulting tree)
    // f is a function that takes a list as an argument and returns a list
    function mapLists (tree, f) {
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

    // Map a function to a node itself and to all descendant nodes
    function mapSelfAndDescendants (f, node) {
        if (node.nodes) {
            node.nodes = _.map(node.nodes, _.partial(mapSelfAndDescendants, f));
        }
        return f(node);
    };

    // Map a function to each node in the tree (and return the resulting tree)
    // f is a function that takes an object as an argument and returns a node
    function mapNodes (tree, f) {
        return _.map(tree, _.partial(mapSelfAndDescendants, f));
    };

    function matchById (id) {
        return (function(x) {
            return x.id === id;
        });
    };

    function moveUpByIdHelper (id) {
        return function(tree) {
            return moveUp(tree, matchById(id));
        };
    };

    function moveDownByIdHelper (id) {
        return function(tree) {
            return moveDown(tree, matchById(id));
        };
    };

    // Find the first node having node.id=id and move it up in its containing list.
    function moveUpById (tree, id) {
        return mapLists(tree, moveUpByIdHelper(id));
    };

    // Find the first node having node.id=id and move it down in its containing list.
    function moveDownById (tree, id) {
        return mapLists(tree, moveDownByIdHelper(id));
    };

    function map_helper (acc, f, node) {
        var result = acc.concat(f(node));
        if (node.nodes) {
            var children = _.map(node.nodes, _.partial(map_helper, acc, f));
            return result.concat(children);
        } else {
            return result;
        }
    };

    // Return a flat list that is the result of applying function f to every node.
    // f is a function that takes a node (JSON object) and returns a node.
    function mapToList (tree, f) {
        var result = [];
        for (var i = 0; i < tree.length; i++) {
            result.push(map_helper([], f, tree[i]));
        }
        return _.flattenDeep(result);
    };

    exports.leaves = leaves;
    exports.before = before;
    exports.after = after;
    exports.moveUp = moveUp;
    exports.moveDown = moveDown;
    exports.moveUpById = moveUpById;
    exports.moveDownById = moveDownById;
    exports.mapLists = mapLists;
    exports.mapNodes = mapNodes;
    exports.mapToList = mapToList;
    return exports;
};

// name for old style JS to use
var json_tree_hof = module.exports;

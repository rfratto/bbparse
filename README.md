# BBParse 

BBParse is a JavaScript library to parse BBCode-like expressions. It will return an object with the following properties:

- `value` stores the value of the node. If this node has a non-empty property for `child`, then the value is the name of the tag without the brackets `[` and `]`.

- `child` stores the child node for this node if this node is a tag. For example, given the text `[b]hey[/b]`, the current node will be of value `b` and it's child will be of value `hey`. 

- `next` stores an array of the next nodes. 

There will never be more than one child node. That is to say, the text `[wrapper][a]hey[/a][b]whoa[/b][/wrapper]` will return the following object:

```
{
	value: "wrapper",
	child: {
		value: "a",
		child: { value: "hey" },
		next: [{
			value: "b",
			child: { value: "whoa" }
			next: [{}]
		}]
	},
	next: [{}]
}
``` 

Broken tags (i.e., tags that that are missing their open or close tag) will be merged into a node with the brackets. For example, `[a]hello` will return the following object:

```
{ 
	value: "[a]hello"
}
```


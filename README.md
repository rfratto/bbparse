# BBParse 

BBParse is a JavaScript library to parse BBCode-like expressions. It will return an object with the following properties:

- `body` stores the body of the node. If this node has a non-empty property for `child`, then the body is the name of the tag without the brackets `[` and `]`.

- `child` stores the child node for this node if this node is a tag. For example, given the text `[b]hey[/b]`, the current node will have a body of `b` and it's child will have a body of `hey`. 

- `next` stores an array of the next nodes. 

There will never be more than one child node. That is to say, the text `[wrapper][a]Hello [/a][b]world[/b][/wrapper]` will return the following object:

```
{
	body: "wrapper",
	child: {
		body: "a",
		child: { body: "Hello " },
		next: [{
			body: "b",
			child: { body: "world" }
			next: [{}]
		}]
	},
	next: [{}]
}
``` 

Broken tags (i.e., tags that that are missing their open or close tag) will be merged into a node with the brackets. For example, `[a]hello` will return the following object:

```
{ 
	body: "[a]hello"
}
```


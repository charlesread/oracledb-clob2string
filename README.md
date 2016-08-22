You know what pisses me off?  Dealing with LOBs from the `oracledb` Node.js package.

_Makes use of the `co` package to make stuff wait on other stuff, so if you don't know about generators and promises check this [https://davidwalsh.name/async-generators] out first._

So here's an example of how to "stringify them".  In effect, if a SQL result contains a LOB, let's convert it to a string and output the exact same result set, you know, except for the LOB being a string and all.
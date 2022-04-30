# Custom Cache

- utilize react query for list of lines
- child component will call another

## Universe of Data Hooks

1. useLinesData()

- subscribes to number 2

2. useSpecificLineData(lineId: string)

- if we want to send it up the tree, it will cause re-renders everywhere...we
  want to use context prolly to optimize the dom tree

## Universe of Context API

- linesDataContext Provider -> sends one big object -> also has function to send
  only specific line data from the list of lines

-> has a function to which sends ordered lines list after calculating everything
-> has a function sent down for loadMore(lineId: string, howManyBlocks) which
the child line details page can call -> this triggers the axios call and then we
do a setState in context provider which updates the main object that is being
sent down automatically -> has useEffect for socket data -> has

- minimizes function call up the tree and bunch of isolated recoil atoms for
  hacking things around...top down

- socket data should add to the main context data
- for a child to "refetch" instead of adding to the data, need another function
  to serve as the refetch as we are not having a specific useQuery here since it
  would be custom based on when we need certain line data instead of having
  useQueries firing for every line (socket data should handle our need for
  availability and appending data to the context)
- biggest thing is that we need to clear the cache as well and take out old data
  when it fills up
- have isFetching for individual lineIds if we are trying to get more data
- if it's not in the cache, we probably wouldn't have gotten in this child line
  details page as it was pass through props, but still can fetch from here and
  add it to the big tree and thus will be passed down appropriately and re-order
  it in the list of lines

### Update the fetch to include mofidicatios

- use react query to make the basic fetch of lineIds
- have a function within the line list component which takes in new values so
  that the child can send data up whenever data within it changes with react
  query

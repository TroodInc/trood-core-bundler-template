AsyncEntitiesList base example:

```js
import AsyncEntitiesList from '$trood/components/AsyncEntitiesList';

// this.entitiesIsLoading = exampleEntities.getIsLoadingArray();
// this.entitiesNextPage = exampleEntities.getNextPage();
// this.entitiesNextPageAction = () => exampleEntitiesApiActions.loadNextPage();

<AsyncEntitiesList {...{
  isLoading: this.entitiesIsLoading,
  nextPage: this.entitiesNextPage,
  nextPageAction: this.entitiesNextPageAction,
  onClick: (...args) => console.log('onClick', ...args),
}}>
  Code which outputs a paginated list (massive)
</AsyncEntitiesList>
```

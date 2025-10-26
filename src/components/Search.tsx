
  interface Props {
    searchTerm: string,
    setSearchTerm: (text: string) => void
  }
  const Search = ({ searchTerm, setSearchTerm } : Props) => {
    return (
      <div className='search'>
        <div>
          <img src="search.svg" alt="search" />
          <input
          type="text"
          placeholder='Search through thousands of movies'
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>
    )
  }

  export default Search
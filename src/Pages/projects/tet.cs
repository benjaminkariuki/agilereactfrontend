public int removeNumber(int position,int[] prices){
    int[] numbers = prices;
    int indexToRemove = position;
    if (indexToRemove >= 0 && indexToRemove < numbers.Length)
    {
    
        int[] result = new int[numbers.Length - 1];
        for (int i = 0, j = 0; i < numbers.Length; i++)
        {        if (i != indexToRemove)
            {
                result[j] = numbers[i];
                j++;
            }
        }
        // The 'result' array now contains the 'numbers' array with the specified element removed.
    }
}
int arr[20] = {97, 33, 17, 30, 31, 76, 52, 7,  50, 30,
               73, 50, 0,  6,  43, 73, 12, 12, 44, 21};

void swap(int *arr, int a, int b) {
  int t = arr[a];
  arr[a] = arr[b];
  arr[b] = t;
}

void insertion_sort(int *arr, int len) {
  int i = 1;
  int j;
outer_loop_precheck:
  if (i >= len)
    goto outer_loop_done;
  j = i;
inner_loop_precheck:
  if (j <= 0 || arr[j-1] <= arr[j])
    goto inner_loop_done;
  swap(arr, j, j - 1);
  j--;
inner_loop_done:
  i++;
outer_loop_done:
  return;
}

int main() {
  insertion_sort(arr, 20);
  return 0;
}

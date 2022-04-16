#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int arr[20] = {97, 33, 17, 30, 31, 76, 52, 7,  50, 30,
               73, 50, 0,  6,  43, 73, 12, 12, 44, 21};
const int DEFAULT_SIZE = 10;

void swap(int *arr, int a, int b) {
  int t = arr[a];
  arr[a] = arr[b];
  arr[b] = t;
}

void insertion_sort(int *arr, int len) {
  int i = 1;
  int j;
  while (i < len) {
    j = i;
    while (j > 0 && arr[j - 1] > arr[j]) {
      swap(arr, j, j - 1);
      j--;
    }
    i++;
  }
}

int append_to_string(char *string, int v, int appendSpace) {
  int bytes_written;
  if (appendSpace) {
    bytes_written = sprintf(string, "%d ", v);
  } else {
    bytes_written = sprintf(string, "%d]", v);
  }
  return bytes_written;
}

char *arr_to_string(int *arr, int len) {
  /* Get string length */
  /* 1 for null byte, 1 for start bracket, one for end bracket and len-1 spaces
   * between numbers */
  int string_len = 1 + 1 + 1 + len - 1;
  char *string;
  int i;
  int current_index = 1;
  for (i = 0; i < len; i++) {
    int cur = arr[i];
    while (cur > 0) {
      cur /= 10;
      string_len++;
    }
  }

  string = (char *)malloc(string_len);
  if (string == NULL) {
    printf("Failed to allocate string\n");
    return NULL;
  }

  string[0] = '[';
  for (i = 0; i < len; i++) {
    int bytes_written = append_to_string(string + current_index, arr[i], (i != len-1));
    if (bytes_written == -1) {
      return NULL;
    }
    current_index += bytes_written;
  }
  return string;
}

int main() {
  insertion_sort(arr, 20);
  char* string = arr_to_string(arr, 20);
  printf("%s\n", string);
  free(string);
}
